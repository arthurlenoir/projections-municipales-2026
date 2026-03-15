export interface Candidate {
  id: string
  listNumber: number
  listName: string
  headName: string
  photoUrl?: string
  color: string
}

export interface City {
  id: string
  name: string
  candidates: Candidate[]
}

// candidate id → vote percentage (0-100)
export type FirstRoundResults = Record<string, number>

// source candidate id → (target candidate id → percentage)
// "abstain" is a special target key for votes that don't transfer
export type TransferMatrix = Record<string, Record<string, number>>

// sourceId → merge entry: the list they formally merge into + transfer rate
// Invariant: hostId must have ≥10%; a host cannot itself be a source in MergeMap
export interface MergeEntry {
  hostId: string
  rate: number  // 0–100: % of source votes transferred to host (rest → abstention)
}
export type MergeMap = Record<string, MergeEntry>

// qualified: ≥10%, OR top-2 fallback (when fewer than 2 lists hit ≥10%)
// eligible:  ≥5% and <10% (can merge into a qualified list, otherwise eliminated)
// eliminated: <5% (always out, unless they are in the top-2 fallback)
export type CandidateStatus = 'qualified' | 'eligible' | 'eliminated'
