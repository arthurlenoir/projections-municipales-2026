import { useState } from 'react'
import type { City, FirstRoundResults, MergeMap, TransferMatrix } from '../types'
import { getCandidateStatus, getQualifyingIds } from '../simulation'

interface Props {
  city: City
  firstRound: FirstRoundResults
  transfers: TransferMatrix
  merges: MergeMap
  onChange: (sourceId: string, targetId: string, pct: number) => void
  onRemove: (sourceId: string, targetId: string) => void
}

interface TransferRowProps {
  sourceId: string
  city: City
  qualifyingIds: string[]
  transfers: TransferMatrix
  onChange: Props['onChange']
  onRemove: Props['onRemove']
}

function TransferRow({ sourceId, city, qualifyingIds, transfers, onChange, onRemove }: TransferRowProps) {
  const [open, setOpen] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState('')

  const source = city.candidates.find(c => c.id === sourceId)!
  const sourceTransfers = transfers[sourceId] ?? {}
  const totalPct = Object.values(sourceTransfers).reduce((s, v) => s + v, 0)
  const remaining = Math.max(0, 100 - totalPct)

  // Transfer targets: only round-2 qualifiers + abstain
  const availableTargets = [
    ...city.candidates.filter(c =>
      qualifyingIds.includes(c.id) &&
      c.id !== sourceId &&
      !(c.id in sourceTransfers)
    ),
    ...(('abstain' in sourceTransfers) ? [] : [{ id: 'abstain', listName: 'Votes perdus / abstention', listNumber: 0, headName: '', color: '#999' }]),
  ]

  function addTransfer() {
    if (!selectedTarget) return
    onChange(sourceId, selectedTarget, 0)
    setSelectedTarget('')
  }

  return (
    <div className="transfer-row">
      <button className="transfer-header" onClick={() => setOpen(o => !o)}>
        <span className="transfer-color" style={{ backgroundColor: source.color }} />
        <span className="transfer-name">{source.headName}</span>
        <span className="transfer-list">{source.listName}</span>
        <span className="transfer-summary">
          {Object.keys(sourceTransfers).length > 0
            ? `${totalPct.toFixed(0)}% distribués · ${remaining.toFixed(0)}% retenus`
            : 'Aucun report défini'}
        </span>
        <span className="transfer-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="transfer-body">
          {Object.entries(sourceTransfers).map(([targetId, pct]) => {
            const target = city.candidates.find(c => c.id === targetId)
            const label = targetId === 'abstain'
              ? 'Votes perdus / abstention'
              : target
                ? `${target.headName} — ${target.listName}`
                : targetId
            return (
              <div key={targetId} className="transfer-entry">
                {targetId !== 'abstain' && target && (
                  <span className="transfer-color-small" style={{ backgroundColor: target.color }} />
                )}
                {targetId === 'abstain' && (
                  <span className="transfer-color-small" style={{ backgroundColor: '#999' }} />
                )}
                <span className="transfer-entry-label">{label}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={pct === 0 ? '' : pct}
                  placeholder="0"
                  onChange={e => {
                    const v = parseFloat(e.target.value)
                    onChange(sourceId, targetId, isNaN(v) ? 0 : Math.max(0, Math.min(100, v)))
                  }}
                  className="transfer-input"
                />
                <span className="transfer-pct-symbol">%</span>
                <button
                  className="transfer-remove"
                  onClick={() => onRemove(sourceId, targetId)}
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            )
          })}

          <div className="transfer-remaining">
            Votes vers abstention si non redistribués : <strong>{remaining.toFixed(1)}%</strong>
            {totalPct > 100.05 && <span className="total-warning"> ⚠ Dépasse 100%</span>}
          </div>

          {availableTargets.length > 0 && (
            <div className="transfer-add">
              <select
                value={selectedTarget}
                onChange={e => setSelectedTarget(e.target.value)}
                className="transfer-select"
              >
                <option value="">— Ajouter un report vers…</option>
                {availableTargets.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.id === 'abstain' ? 'Votes perdus / abstention' : `${(t as typeof city.candidates[0]).headName} — ${t.listName}`}
                  </option>
                ))}
              </select>
              <button onClick={addTransfer} disabled={!selectedTarget} className="btn-add">
                Ajouter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function TransferMatrixEditor({ city, firstRound, transfers, merges, onChange, onRemove }: Props) {
  const qualifyingIds = getQualifyingIds(city.candidates, firstRound, merges)

  // Show eliminated candidates and eligible (5–10%) candidates not absorbed by a merge
  const nonQualifiedAndNotMerged = city.candidates.filter(c => {
    const status = getCandidateStatus(c.id, city.candidates, firstRound)
    const isMerged = c.id in merges
    return (status === 'eliminated' || status === 'eligible') && !isMerged
  })

  return (
    <section className="section">
      <h2>3. Reports de voix</h2>
      <p className="section-desc">
        Pour chaque liste éliminée ou non-fusionnée (entre 5% et 10%), définissez vers qui vont ses électeurs au second tour.
        Les votes non redistribués sont considérés comme perdus (abstention).
      </p>

      {nonQualifiedAndNotMerged.length === 0 ? (
        <p className="section-empty">
          Toutes les listes présentes au second tour — aucun report à définir.
        </p>
      ) : (
        <div className="transfer-list">
          {nonQualifiedAndNotMerged.map(candidate => (
            <TransferRow
              key={candidate.id}
              sourceId={candidate.id}
              city={city}
              qualifyingIds={qualifyingIds}
              transfers={transfers}
              onChange={onChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </section>
  )
}
