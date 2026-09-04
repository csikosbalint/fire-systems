'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import useDisciplineTrackerAdapter from '@models/DisciplineTracker'
import type { Ticker } from '@shared/types/Ticker'
import { Button } from '@ui/button'
import DisciplineTrackerChart from './components/DisciplineTrackerChart'
import DisciplineTrackerTable from './components/DisciplineTrackerTable'
import TrackerTickerInput from './components/TrackerTickerInput'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const currency = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export default function DisciplineTracker() {
  const adapter = useDisciplineTrackerAdapter()
  const { addPivot, clearSearch, removePivot, searchTickers, setInitialCapital } =
    adapter.useController()
  const { initialCapital, pivots, results, calculation, chart } = adapter.usePresenter()
  const [capitalInput, setCapitalInput] = useState(String(initialCapital))
  const [pivotDate, setPivotDate] = useState(today)
  const [alertDate, setAlertDate] = useState('')
  const [ticker, setTicker] = useState<Ticker | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    setCapitalInput(String(initialCapital))
  }, [initialCapital])

  const saveInitialCapital = () => {
    const value = Number(capitalInput)
    if (Number.isFinite(value) && value > 0) {
      setInitialCapital(value)
      setCapitalInput(String(value))
      return
    }
    setCapitalInput(String(initialCapital))
  }

  const addTransaction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!ticker) {
      setFormError('Select a ticker from the search results.')
      return
    }
    if (!pivotDate || pivotDate > today()) {
      setFormError('Choose a valid date that is not in the future.')
      return
    }
    if (alertDate && (alertDate > pivotDate || alertDate > today())) {
      setFormError('Alert date must be on or before the actual pivot date.')
      return
    }
    const added = addPivot({
      id: crypto.randomUUID(),
      date: pivotDate,
      ...(alertDate ? { alertDate } : {}),
      ticker,
    })
    if (!added) {
      setFormError('Only one portfolio pivot can be recorded per date.')
      return
    }
    setTicker(null)
    setPivotDate(today())
    setAlertDate('')
    setFormError(null)
    clearSearch()
  }

  return (
    <section className="flex min-h-0 flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3 pb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Discipline Tracker</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track full-portfolio ticker pivots and their performance.
          </p>
        </div>
        <label className="grid gap-1 text-sm font-medium">
          Initial portfolio (EUR)
          <input
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            value={capitalInput}
            onChange={(event) => setCapitalInput(event.target.value)}
            onBlur={saveInitialCapital}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur()
            }}
            aria-label="Initial portfolio value in EUR"
            className="h-9 w-40 rounded-md border border-input bg-transparent px-3 text-right text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </label>
      </div>

      <form onSubmit={addTransaction} className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="grid gap-1 text-xs text-muted-foreground">
            Actual pivot
            <input
              type="date"
              value={pivotDate}
              onChange={(event) => setPivotDate(event.target.value)}
              aria-label="Actual pivot date"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            Alert date
            <input
              type="date"
              max={pivotDate || today()}
              value={alertDate}
              onChange={(event) => {
                setAlertDate(event.target.value)
                setFormError(null)
              }}
              aria-label="Alert date (optional)"
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </label>
          <TrackerTickerInput
            results={results}
            onSearch={searchTickers}
            onSelect={(selectedTicker) => {
              setTicker(selectedTicker)
              setFormError(null)
            }}
          />
          <Button type="submit" size="icon" aria-label="Add portfolio pivot" title="Add pivot">
            <Plus />
          </Button>
        </div>
        {ticker && (
          <p className="text-xs text-muted-foreground">
            Next holding: {ticker.ticker} · {ticker.name}
          </p>
        )}
        {formError && <p className="text-xs text-destructive">{formError}</p>}
      </form>

      <section className="flex h-[280px] w-full flex-col bg-card sm:h-[320px]">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Portfolio Performance</h3>
            <p className="text-xs text-muted-foreground">
              250 fiscal days · all lines normalized to {currency.format(initialCapital)}
            </p>
          </div>
        </div>
        <div className="min-h-0 flex-1 px-1 pb-1 pt-0">
          <DisciplineTrackerChart {...chart} pivots={pivots} />
        </div>
      </section>

      <DisciplineTrackerTable
        pivots={pivots}
        calculation={calculation}
        isLoading={chart.isLoading}
        onRemove={removePivot}
      />
    </section>
  )
}
