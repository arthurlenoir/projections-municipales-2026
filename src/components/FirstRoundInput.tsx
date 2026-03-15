import type { City, FirstRoundResults } from '../types'
import { getCandidateStatus } from '../simulation'
import { CandidateCard } from './CandidateCard'

interface Props {
  city: City
  firstRound: FirstRoundResults
  onChange: (id: string, value: number) => void
}

export function FirstRoundInput({ city, firstRound, onChange }: Props) {
  const total = city.candidates.reduce((sum, c) => sum + (firstRound[c.id] ?? 0), 0)
  const totalRounded = Math.round(total * 10) / 10
  const isOver = total > 100.05

  return (
    <section className="section">
      <h2>1. Résultats du premier tour</h2>
      <p className="section-desc">
        Saisissez les pourcentages obtenus par chaque liste au premier tour.
      </p>

      <div className="candidates-grid">
        {city.candidates.map(candidate => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            value={firstRound[candidate.id] ?? 0}
            status={getCandidateStatus(candidate.id, city.candidates, firstRound)}
            onChange={onChange}
          />
        ))}
      </div>

      <div className={`total-bar ${isOver ? 'total-over' : ''}`}>
        <span>Total saisi :</span>
        <strong>{totalRounded.toFixed(1)} %</strong>
        {isOver && <span className="total-warning">⚠ Dépasse 100 %</span>}
      </div>
    </section>
  )
}
