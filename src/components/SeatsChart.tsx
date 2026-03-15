import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import type { Candidate, FirstRoundResults, MergeMap } from '../types'
import { getQualifyingIds } from '../simulation'
import { allocateSeats } from '../seatAllocation'

const TOTAL_SEATS = 69

interface Props {
  candidates: Candidate[]
  firstRound: FirstRoundResults
  projection: Record<string, number>
  merges: MergeMap
}

export function SeatsChart({ candidates, firstRound, projection, merges }: Props) {
  const qualifyingIds = getQualifyingIds(candidates, firstRound, merges)

  if (qualifyingIds.length === 0) {
    return (
      <section className="section">
        <h2>5. Répartition des sièges</h2>
        <p className="section-desc muted">
          Saisissez les résultats du premier tour pour voir la répartition des sièges.
        </p>
      </section>
    )
  }

  const seats = allocateSeats(candidates, firstRound, projection, merges, TOTAL_SEATS)

  const data = qualifyingIds
    .map(hostId => {
      const absorbedIds = Object.entries(merges)
        .filter(([, e]) => e.hostId === hostId)
        .map(([sId]) => sId)
      const allIds = [hostId, ...absorbedIds]
      const host = candidates.find(c => c.id === hostId)!
      const label = allIds
        .map(id => candidates.find(c => c.id === id)!.headName.split(' ').at(-1))
        .join(' + ')
      const fullLabel = allIds
        .map(id => candidates.find(c => c.id === id)!.headName)
        .join(' + ')
      const result = seats[hostId] ?? { bonus: 0, proportional: 0, total: 0 }
      return {
        hostId,
        name: label,
        fullName: fullLabel,
        listName: host.listName,
        bonus: result.bonus,
        proportional: result.proportional,
        total: result.total,
        color: host.color,
      }
    })
    .sort((a, b) => b.total - a.total)

  const ticks = Array.from({ length: Math.floor(TOTAL_SEATS / 10) + 1 }, (_, i) => i * 10)

  return (
    <section className="section">
      <h2>5. Répartition des sièges</h2>
      <p className="section-desc">
        Répartition des {TOTAL_SEATS} sièges : prime majoritaire (50 % arrondis au supérieur) + D'Hondt proportionnel.
      </p>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={Math.max(400, data.length * 42)}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 60, left: 160, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, TOTAL_SEATS]}
              ticks={ticks}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={155}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value, name) => {
                const label = name === 'bonus' ? 'Prime majoritaire' : 'Proportionnel'
                return [`${value} siège${(value as number) > 1 ? 's' : ''}`, label]
              }}
              labelFormatter={(label) => {
                const entry = data.find(d => d.name === String(label))
                if (!entry) return String(label)
                return `${entry.fullName} — ${entry.listName} (${entry.total} sièges)`
              }}
            />
            <Bar dataKey="bonus" stackId="seats" isAnimationActive={false}>
              {data.map(entry => (
                <Cell key={entry.hostId} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="proportional" stackId="seats" radius={[0, 3, 3, 0]} isAnimationActive={false}>
              {data.map(entry => (
                <Cell key={entry.hostId} fill={entry.color} fillOpacity={0.55} />
              ))}
              <LabelList
                dataKey="total"
                position="right"
                formatter={(v: unknown) => `${v}`}
                style={{ fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
