import type { Candidate, CandidateStatus, FirstRoundResults, MergeMap, TransferMatrix } from './types'

export function getCandidateStatus(
  candidateId: string,
  candidates: Candidate[],
  firstRound: FirstRoundResults,
): CandidateStatus {
  const score = firstRound[candidateId] ?? 0
  const qualifiedCount = candidates.filter(c => (firstRound[c.id] ?? 0) >= 10).length

  if (score >= 10) return 'qualified'

  // Top-2 fallback: if fewer than 2 lists have ≥10%, top-2 by score are 'qualified'
  if (qualifiedCount < 2) {
    const sorted = [...candidates].sort((a, b) => (firstRound[b.id] ?? 0) - (firstRound[a.id] ?? 0))
    const top2Ids = sorted.slice(0, 2).map(c => c.id)
    if (top2Ids.includes(candidateId)) return 'qualified'
  }

  if (score >= 5) return 'eligible'
  return 'eliminated'
}

export function getQualifyingIds(
  candidates: Candidate[],
  firstRound: FirstRoundResults,
  merges: MergeMap,
): string[] {
  return candidates
    .filter(c => {
      const status = getCandidateStatus(c.id, candidates, firstRound)
      return status === 'qualified' && !(c.id in merges)
    })
    .map(c => c.id)
}

export function simulate(
  candidates: Candidate[],
  firstRound: FirstRoundResults,
  transfers: TransferMatrix,
  merges: MergeMap,
): Record<string, number> {
  const score: Record<string, number> = {}

  for (const candidate of candidates) {
    score[candidate.id] = firstRound[candidate.id] ?? 0
  }

  // Apply merges: add source votes to host (at rate%), zero out source
  for (const [sourceId, entry] of Object.entries(merges)) {
    if (entry.hostId in score) {
      score[entry.hostId] += (score[sourceId] ?? 0) * entry.rate / 100
      score[sourceId] = 0
    }
  }

  // Apply transfers, skipping merged sources
  for (const source of candidates) {
    if (source.id in merges) continue

    const sourceVotes = firstRound[source.id] ?? 0
    if (sourceVotes === 0) continue

    const sourceTransfers = transfers[source.id] ?? {}
    let transferred = 0

    for (const [targetId, pct] of Object.entries(sourceTransfers)) {
      if (targetId === source.id) continue
      const given = sourceVotes * pct / 100
      transferred += given
      if (targetId !== 'abstain') {
        // Route to host if target was merged
        const resolved = merges[targetId]?.hostId ?? targetId
        if (resolved in score) {
          score[resolved] += given
        }
      }
    }

    const status = getCandidateStatus(source.id, candidates, firstRound)
    if (status === 'qualified') {
      score[source.id] -= transferred   // qualified: keep un-transferred votes
    } else {
      score[source.id] = 0              // eliminated/eligible: un-transferred votes abstain
    }
  }

  return score
}
