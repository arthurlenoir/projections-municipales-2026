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

interface Props {
  candidates: Candidate[]
  firstRound: FirstRoundResults
  projection: Record<string, number>
  merges: MergeMap
}

export function ProjectionChart({ candidates, firstRound, projection, merges }: Props) {
  const qualifyingIds = getQualifyingIds(candidates, firstRound, merges)

  if (qualifyingIds.length === 0) {
    return (
      <section className="section">
        <h2>4. Projection second tour</h2>
        <p className="section-desc muted">
          Saisissez les résultats du premier tour pour voir la projection.
        </p>
      </section>
    )
  }

  const total = qualifyingIds.reduce((sum, id) => sum + Math.max(0, projection[id] ?? 0), 0)

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
      return {
        hostId,
        name: label,
        fullName: fullLabel,
        listName: host.listName,
        score: total > 0 ? Math.round(Math.max(0, projection[hostId] ?? 0) / total * 1000) / 10 : 0,
        color: host.color,
      }
    })
    .sort((a, b) => b.score - a.score)

  return (
    <section className="section">
      <h2>4. Projection second tour</h2>
      <p className="section-desc">
        Scores projetés au second tour, après fusions et reports de voix.
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
              domain={[0, 'dataMax']}
              tickFormatter={v => `${v}%`}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={155}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Score projeté']}
              labelFormatter={(label) => {
                const entry = data.find(d => d.name === String(label))
                return entry ? `${entry.fullName} — ${entry.listName}` : String(label)
              }}
            />
            <Bar dataKey="score" radius={[0, 3, 3, 0]}>
              {data.map(entry => (
                <Cell key={entry.hostId} fill={entry.color} />
              ))}
              <LabelList
                dataKey="score"
                position="right"
                formatter={(v: unknown) => `${(v as number).toFixed(1)}%`}
                style={{ fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
