import type { Candidate, CandidateStatus } from '../types'

interface Props {
  candidate: Candidate
  value: number
  status?: CandidateStatus
  onChange: (id: string, value: number) => void
}

const STATUS_LABELS: Record<CandidateStatus, string> = {
  qualified: 'Qualifiée',
  eligible: 'Peut fusionner',
  eliminated: 'Éliminée',
}

export function CandidateCard({ candidate, value, status, onChange }: Props) {
  return (
    <div className="candidate-card">
      <div className="candidate-color-bar" style={{ backgroundColor: candidate.color }} />
      <div className="candidate-info">
        <div className="candidate-number">Liste {candidate.listNumber}</div>
        <div className="candidate-head">{candidate.headName}</div>
        <div className="candidate-list">{candidate.listName}</div>
      </div>
      <div className="candidate-input-wrap">
        {status && value > 0 && (
          <span className={`status-badge status-badge--${status}`}>
            {STATUS_LABELS[status]}
          </span>
        )}
        <input
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={e => {
            const v = parseFloat(e.target.value)
            onChange(candidate.id, isNaN(v) ? 0 : Math.max(0, Math.min(100, v)))
          }}
          className="candidate-input"
        />
        <span className="candidate-pct-symbol">%</span>
      </div>
    </div>
  )
}
