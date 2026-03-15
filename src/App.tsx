import type { City, FirstRoundResults, MergeMap, TransferMatrix } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { cities } from './data/cities'
import { simulate, getCandidateStatus } from './simulation'
import { FirstRoundInput } from './components/FirstRoundInput'
import { MergeEditor } from './components/MergeEditor'
import { TransferMatrixEditor } from './components/TransferMatrix'
import { ProjectionChart } from './components/ProjectionChart'
import { SeatsChart } from './components/SeatsChart'
import './index.css'

interface CityAppProps {
  city: City
}

function CityApp({ city }: CityAppProps) {
  const [firstRound, setFirstRound] = useLocalStorage<FirstRoundResults>(`proj-${city.id}-firstRound`, {})
  const [transfers, setTransfers] = useLocalStorage<TransferMatrix>(`proj-${city.id}-transfers`, {})
  const [merges, setMerges] = useLocalStorage<MergeMap>(`proj-${city.id}-merges`, {})

  function handleFirstRoundChange(id: string, value: number) {
    setFirstRound(prev => {
      const next = { ...prev, [id]: value }
      setMerges(prevMerges => {
        const cleaned = { ...prevMerges }
        for (const [sourceId, entry] of Object.entries(prevMerges)) {
          const sourceStatus = getCandidateStatus(sourceId, city.candidates, next)
          const hostStatus = getCandidateStatus(entry.hostId, city.candidates, next)
          if (sourceStatus === 'eliminated' || hostStatus !== 'qualified') {
            delete cleaned[sourceId]
          }
        }
        return cleaned
      })
      return next
    })
  }

  function handleMerge(sourceId: string, hostId: string | null) {
    setMerges(prev => {
      const next = { ...prev }
      if (hostId === null) delete next[sourceId]
      else next[sourceId] = { hostId, rate: 100 }
      return next
    })
  }

  function handleMergeRate(sourceId: string, rate: number) {
    setMerges(prev => {
      if (!(sourceId in prev)) return prev
      return { ...prev, [sourceId]: { ...prev[sourceId], rate } }
    })
  }

  function handleTransferChange(sourceId: string, targetId: string, pct: number) {
    setTransfers(prev => ({
      ...prev,
      [sourceId]: { ...(prev[sourceId] ?? {}), [targetId]: pct },
    }))
  }

  function handleTransferRemove(sourceId: string, targetId: string) {
    setTransfers(prev => {
      const next = { ...(prev[sourceId] ?? {}) }
      delete next[targetId]
      return { ...prev, [sourceId]: next }
    })
  }

  function handleReset() {
    setFirstRound({})
    setTransfers({})
    setMerges({})
  }

  const projection = simulate(city.candidates, firstRound, transfers, merges)

  return (
    <main className="app-main">
      <div className="city-toolbar">
        <span>1er tour : 15 mars · 2e tour : 22 mars</span>
        <button className="btn-reset" onClick={handleReset}>Réinitialiser</button>
      </div>

      <FirstRoundInput
        city={city}
        firstRound={firstRound}
        onChange={handleFirstRoundChange}
      />

      <MergeEditor
        city={city}
        firstRound={firstRound}
        merges={merges}
        onMerge={handleMerge}
        onMergeRate={handleMergeRate}
      />

      <TransferMatrixEditor
        city={city}
        firstRound={firstRound}
        transfers={transfers}
        merges={merges}
        onChange={handleTransferChange}
        onRemove={handleTransferRemove}
      />

      <ProjectionChart
        candidates={city.candidates}
        firstRound={firstRound}
        projection={projection}
        merges={merges}
      />

      <SeatsChart
        candidates={city.candidates}
        firstRound={firstRound}
        projection={projection}
        merges={merges}
        totalSeats={city.totalSeats}
      />
    </main>
  )
}

function App() {
  const [selectedCityId, setSelectedCityId] = useLocalStorage<string>('proj-city', 'montpellier')
  const city = cities.find(c => c.id === selectedCityId) ?? cities[0]

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <h1>Projections municipales 2026</h1>
          <div className="app-subtitle">
            <select
              className="city-select"
              value={city.id}
              onChange={e => setSelectedCityId(e.target.value)}
            >
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <CityApp key={city.id} city={city} />

      <footer className="app-footer">
        Simulation indicative — résultats non officiels
      </footer>
    </div>
  )
}

export default App
