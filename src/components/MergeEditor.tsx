import type { City, FirstRoundResults, MergeMap } from '../types'
import { getCandidateStatus } from '../simulation'

interface Props {
  city: City
  firstRound: FirstRoundResults
  merges: MergeMap
  onMerge: (sourceId: string, hostId: string | null) => void
  onMergeRate: (sourceId: string, rate: number) => void
}

export function MergeEditor({ city, firstRound, merges, onMerge, onMergeRate }: Props) {
  const { candidates } = city

  const hasAnyScore = candidates.some(c => (firstRound[c.id] ?? 0) > 0)
  const hasEligible = candidates.some(c => {
    const s = getCandidateStatus(c.id, candidates, firstRound)
    return s === 'qualified' || s === 'eligible'
  })

  if (!hasAnyScore || !hasEligible) {
    return (
      <section className="section">
        <h2>2. Fusions de listes</h2>
        <p className="section-desc muted">
          Saisissez les résultats du premier tour pour voir les fusions possibles.
        </p>
      </section>
    )
  }

  // Candidates with ≥5%
  const relevantCandidates = candidates.filter(c => {
    const s = getCandidateStatus(c.id, candidates, firstRound)
    return s === 'qualified' || s === 'eligible'
  })

  // Qualified candidates that can act as hosts:
  // - must be 'qualified'
  // - must not themselves be a source in merges (absorbed)
  const potentialHosts = candidates.filter(c => {
    const s = getCandidateStatus(c.id, candidates, firstRound)
    return s === 'qualified' && !(c.id in merges)
  })

  const qualifiedCount = candidates.filter(c => getCandidateStatus(c.id, candidates, firstRound) === 'qualified').length
  const mergeCount = Object.keys(merges).length
  const eliminatedCount = candidates.filter(c => getCandidateStatus(c.id, candidates, firstRound) === 'eliminated').length

  return (
    <section className="section">
      <h2>2. Fusions de listes</h2>
      <p className="section-desc">
        Déclarez les fusions officielles entre listes avant le second tour.
      </p>

      <div className="merge-summary">
        <span>{qualifiedCount} qualifiée{qualifiedCount > 1 ? 's' : ''}</span>
        <span className="merge-summary-dot">·</span>
        <span>{mergeCount} fusion{mergeCount > 1 ? 's' : ''}</span>
        <span className="merge-summary-dot">·</span>
        <span>{eliminatedCount} éliminée{eliminatedCount > 1 ? 's' : ''}</span>
      </div>

      <div className="merge-list">
        {relevantCandidates.map(candidate => {
          const status = getCandidateStatus(candidate.id, candidates, firstRound)
          const currentHost = merges[candidate.id]?.hostId ?? ''

          // Available hosts: qualified, not self, not already absorbed
          const availableHosts = potentialHosts.filter(h => h.id !== candidate.id)

          return (
            <div key={candidate.id} className="merge-row">
              <span className="merge-color" style={{ backgroundColor: candidate.color }} />
              <span className="merge-name">{candidate.headName}</span>
              <span className="merge-list-name">{candidate.listName}</span>
              <span className={`status-badge status-badge--${status}`}>
                {status === 'qualified' ? 'Qualifiée (≥10%)' : 'Peut fusionner (≥5%)'}
              </span>
              {status === 'eligible' && (
                <select
                  className="merge-select"
                  value={currentHost}
                  onChange={e => onMerge(candidate.id, e.target.value || null)}
                >
                  <option value="">— Aucune fusion</option>
                  {availableHosts.map(host => (
                    <option key={host.id} value={host.id}>
                      {host.headName} — {host.listName}
                    </option>
                  ))}
                </select>
              )}
              {status === 'qualified' && !(candidate.id in merges) && availableHosts.length > 0 && (
                <select
                  className="merge-select"
                  value={currentHost}
                  onChange={e => onMerge(candidate.id, e.target.value || null)}
                >
                  <option value="">— Aucune fusion</option>
                  {availableHosts.map(host => (
                    <option key={host.id} value={host.id}>
                      {host.headName} — {host.listName}
                    </option>
                  ))}
                </select>
              )}
              {candidate.id in merges && (
                <span className="merge-absorbed">
                  → {candidates.find(c => c.id === merges[candidate.id]?.hostId)?.headName}
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={merges[candidate.id].rate}
                    onChange={e => {
                      const v = parseFloat(e.target.value)
                      onMergeRate(candidate.id, isNaN(v) ? 100 : Math.max(0, Math.min(100, v)))
                    }}
                    className="merge-rate-input"
                    title="Taux de transfert (%)"
                  />
                  <span className="merge-rate-symbol">%</span>
                  <button
                    className="merge-clear"
                    onClick={() => onMerge(candidate.id, null)}
                    title="Annuler la fusion"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
