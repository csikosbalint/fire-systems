'use client'

import { useEffect, useState } from 'react'
import type { HistoricalData } from '@csikosbalint/fire-app/ports'
import { download, search } from '@adapters/server/TickerOps'
import type { Ticker } from '@shared/types/Ticker'
import type { PricePoint, TrackerPivot } from '@shared/types/DisciplineTracker'
import {
  calculateTracker,
  createChartSeries,
} from './DisciplineTrackerCalculations'
import useDisciplineTrackerStore from './DisciplineTrackerStore'

const CHART_DAYS = 250

function formatDate(date: string | Date): string {
  if (typeof date === 'string') return date.slice(0, 10)
  return date.toISOString().slice(0, 10)
}

function toPricePoints(data: HistoricalData[]): PricePoint[] {
  return data
    .map((item) => ({
      date: formatDate(item.date),
      price: item.adjclose ?? item.close,
    }))
    .filter((point) => Number.isFinite(point.price) && point.price > 0)
}

function uniqueTickers(pivots: TrackerPivot[]): Ticker[] {
  return Array.from(
    new Map(pivots.map((pivot) => [pivot.ticker.ticker, pivot.ticker])).values()
  )
}

function earliestPivotDate(pivots: TrackerPivot[]): Date | undefined {
  const first = [...pivots].sort((left, right) => left.date.localeCompare(right.date))[0]
  return first ? new Date(`${first.date}T00:00:00.000Z`) : undefined
}

export default function useDisciplineTrackerAdapter() {
  const [results, setResults] = useState<Ticker[]>([])
  const [pricesByTicker, setPricesByTicker] = useState<Record<string, PricePoint[]>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const useController = () => {
    const addPivot = useDisciplineTrackerStore((state) => state.addPivot)
    const removePivot = useDisciplineTrackerStore((state) => state.removePivot)
    const setInitialCapital = useDisciplineTrackerStore(
      (state) => state.setInitialCapital
    )

    const searchTickers = async (keyword: string) => {
      if (!keyword.trim()) {
        setResults([])
        return
      }
      try {
        setResults(await search(keyword.trim().toUpperCase()))
      } catch (searchError) {
        console.error('Error searching for tracker ticker:', searchError)
        setResults([])
      }
    }

    return {
      addPivot,
      removePivot,
      setInitialCapital,
      searchTickers,
      clearSearch: () => setResults([]),
    }
  }

  const usePresenter = () => {
    const initialCapital = useDisciplineTrackerStore((state) => state.initialCapital)
    const pivots = useDisciplineTrackerStore((state) => state.pivots)

    useEffect(() => {
      let stale = false
      const tickers = uniqueTickers(pivots)
      if (tickers.length === 0) {
        setPricesByTicker({})
        setIsLoading(false)
        setError(null)
        return
      }

      setIsLoading(true)
      setError(null)
      const startDate = earliestPivotDate(pivots)

      Promise.all(
        tickers.map(async (ticker) => [
          ticker.ticker,
          toPricePoints(await download({ ticker, startDate })),
        ] as const)
      )
        .then((entries) => {
          if (stale) return
          setPricesByTicker(Object.fromEntries(entries))
        })
        .catch((loadError) => {
          if (stale) return
          console.error('Error loading tracker prices:', loadError)
          setPricesByTicker({})
          setError('Unable to load historical prices for the tracker.')
        })
        .finally(() => {
          if (!stale) setIsLoading(false)
        })

      return () => {
        stale = true
      }
    }, [pivots])

    const calculation = calculateTracker(initialCapital, pivots, pricesByTicker)
    const chartDates = Array.from(
      new Set(Object.values(pricesByTicker).flatMap((prices) => prices.map((price) => price.date)))
    )
      .sort()
      .slice(-CHART_DAYS)

    return {
      initialCapital,
      pivots,
      results,
      calculation,
      chart: {
        dates: chartDates,
        series: createChartSeries(initialCapital, pivots, pricesByTicker, chartDates),
        isLoading,
        error,
      },
    }
  }

  return { useController, usePresenter }
}
