import type { Candidate, FirstRoundResults, MergeMap, MobilizationRates } from '../types'
import { getQualifyingIds } from '../simulation'

interface Props {
  candidates: Candidate[]
  firstRound: FirstRoundResults
  merges: MergeMap
  mobilization: MobilizationRates
  onChange: (id: string, value: number) => void
}

export function MobilizationEditor({ candidates, firstRound, merges, mobilization, onChange }: Props) {
  const qualifyingIds = getQualifyingIds(candidates, firstRound, merges)

  if (qualifyingIds.length === 0) {
    return (
      <section className="section">
        <h2>4. Mobilisation au 2e tour</h2>
        <p className="section-desc muted">
          Saisissez les résultats du premier tour pour voir les listes qualifiées.
        </p>
      </section>
    )
  }

  return (
    <section className="section">
      <h2>4. Mobilisation au 2e tour</h2>
      <p className="section-desc">
        Ajustez le taux de mobilisation de chaque liste qualifiée (100 % = même participation qu'au 1er tour).
      </p>
      <div className="mobilization-rows">
        {qualifyingIds.map(id => {
          const candidate = candidates.find(c => c.id === id)!
          const value = mobilization[id] ?? 100
          return (
            <div key={id} className="mobilization-row">
              <span className="color-dot" style={{ backgroundColor: candidate.color }} />
              <span className="mobilization-name">{candidate.listName}</span>
              <input
                type="number"
                className="mobilization-input"
                min={0}
                max={200}
                step={1}
                value={value}
                onChange={e => onChange(id, Number(e.target.value))}
              />
              <span className="mobilization-suffix">%</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
