import type { Candidate, FirstRoundResults, MergeMap } from './types'
import { getQualifyingIds } from './simulation'

export interface SeatResult {
  bonus: number
  proportional: number
  total: number
}

export function allocateSeats(
  candidates: Candidate[],
  firstRound: FirstRoundResults,
  projection: Record<string, number>,
  merges: MergeMap,
  totalSeats: number,
): Record<string, SeatResult> {
  const qualifyingIds = getQualifyingIds(candidates, firstRound, merges)
  if (qualifyingIds.length === 0) return {}

  const rawTotal = qualifyingIds.reduce((sum, id) => sum + (projection[id] ?? 0), 0)
  if (rawTotal === 0) return {}

  const pct: Record<string, number> = {}
  for (const id of qualifyingIds) {
    pct[id] = ((projection[id] ?? 0) / rawTotal) * 100
  }

  // Step 1 – majority bonus to the winner
  const winnerId = qualifyingIds.reduce((a, b) => (pct[a] >= pct[b] ? a : b))
  const bonusSeats = Math.ceil(totalSeats / 2)
  const remainingSeats = totalSeats - bonusSeats

  // Step 2 – D'Hondt on remaining seats, only lists with ≥5%
  const eligible = qualifyingIds.filter(id => pct[id] >= 5)
  const proportional: Record<string, number> = Object.fromEntries(
    qualifyingIds.map(id => [id, 0])
  )

  if (eligible.length > 0 && remainingSeats > 0) {
    const divisors: Record<string, number> = Object.fromEntries(eligible.map(id => [id, 1]))
    for (let i = 0; i < remainingSeats; i++) {
      const best = eligible.reduce((a, b) =>
        pct[a] / divisors[a] >= pct[b] / divisors[b] ? a : b
      )
      proportional[best]++
      divisors[best]++
    }
  }

  const result: Record<string, SeatResult> = {}
  for (const id of qualifyingIds) {
    const bonus = id === winnerId ? bonusSeats : 0
    result[id] = { bonus, proportional: proportional[id], total: bonus + proportional[id] }
  }
  return result
}
