import type { FirstRoundResults, MergeMap, TransferMatrix } from './types'
import { useLocalStorage } from './hooks/useLocalStorage'
import { montpellierCity } from './data/cities'
import { simulate, getCandidateStatus } from './simulation'
import { FirstRoundInput } from './components/FirstRoundInput'
import { MergeEditor } from './components/MergeEditor'
import { TransferMatrixEditor } from './components/TransferMatrix'
import { ProjectionChart } from './components/ProjectionChart'
import { SeatsChart } from './components/SeatsChart'
import './index.css'

const city = montpellierCity

function App() {
  const [firstRound, setFirstRound] = useLocalStorage<FirstRoundResults>('proj-firstRound', {})
  const [transfers, setTransfers] = useLocalStorage<TransferMatrix>('proj-transfers', {})
  const [merges, setMerges] = useLocalStorage<MergeMap>('proj-merges', {})

  function handleFirstRoundChange(id: string, value: number) {
    setFirstRound(prev => {
      const next = { ...prev, [id]: value }
      // Auto-clear invalid merges: source <5% or host <10% and not top-2 fallback
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
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <h1>Projections municipales 2026</h1>
          <div className="app-subtitle">
            <span className="city-badge">{city.name}</span>
            <span>1er tour : 15 mars · 2e tour : 22 mars</span>
            <button className="btn-reset" onClick={handleReset}>Réinitialiser</button>
          </div>
        </div>
      </header>

      <main className="app-main">
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
        />
      </main>

      <footer className="app-footer">
        Simulation indicative — résultats non officiels
      </footer>
    </div>
  )
}

export default App
