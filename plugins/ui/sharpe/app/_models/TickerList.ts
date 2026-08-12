import { useEffect, useRef, useState } from 'react'
import { SharpeTimeSeries, Ticker } from '@shared/types/Ticker'
import { search, download } from '@adapters/server/TickerOps'
import { calculateMySharpe } from '@adapters/browser/QuoteCalculator'
import useTickerStore from './TickerStore'

const FISCAL_DAYS = 250

function formatDate(date: string | Date): string {
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10)
  }
  const parsed = new Date(date)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }
  return String(date)
}

function clampSharpe(value: number): number {
  return value < 0 ? 0 : Number(value.toFixed(2))
}

function toTimeSeries(
  dataWithSharpe: { date: string | Date; sharpeRatio?: number }[]
): SharpeTimeSeries {
  const withRatio = dataWithSharpe.filter(
    (d) => d.sharpeRatio !== undefined && d.sharpeRatio !== null
  )
  const window = withRatio.slice(-FISCAL_DAYS)
  return {
    dates: window.map((d) => formatDate(d.date)),
    values: window.map((d) => clampSharpe(d.sharpeRatio as number)),
  }
}

export default function useTickerListAdapter() {
  const {
    addTicker,
    removeTicker,
    updateSharpe,
    updateSharpeTimeSeries,
    updateColor,
  } = useTickerStore()
  const [results, setResults] = useState<Ticker[]>([])

  const fetchSharpe = (ticker: Ticker) =>
    download({ ticker })
      .then((data) => data)
      .then((dataWithoutToday) =>
        calculateMySharpe({
          data: dataWithoutToday,
          lookback: 125,
          ticker: ticker.ticker,
        })
      )
      .then((dataWithSharpe) => {
        const timeSeries = toTimeSeries(dataWithSharpe)
        const latest =
          timeSeries.values.length > 0
            ? timeSeries.values[timeSeries.values.length - 1]
            : undefined
        const sharpe = latest !== undefined ? latest.toFixed(2) : 'N/A'

        updateSharpe(ticker.ticker, sharpe)
        if (timeSeries.dates.length > 0) {
          updateSharpeTimeSeries(ticker.ticker, timeSeries)
        }
      })
      .catch((e) => {
        console.error(
          'Error computing sharpe for ticker:',
          e.ticker,
          e.message || e
        )
        updateSharpe(ticker.ticker, e.message || 'Error')
      })

  const useController = () => {
    const tickers = useTickerStore((s) => s.tickers)
    const hasFetchedOnLoad = useRef(false)

    // Watch tickers so this fires after Zustand persist hydrates from localStorage.
    // The ref prevents re-running when updateSharpe later mutates tickers.
    useEffect(() => {
      if (hasFetchedOnLoad.current || tickers.length === 0) return
      hasFetchedOnLoad.current = true
      tickers.filter((t) => !t.sharpe).forEach((t) => fetchSharpe(t))
    }, [tickers])

    const doAddTicker = async ({
      ticker,
    }: {
      ticker: Ticker
    }): Promise<void> => {
      addTicker(ticker)
      fetchSharpe(ticker)
    }

    const doSearch = async (keyword: string) => {
      setResults([])
      if (keyword.trim() === '') return
      return search(keyword)
        .then(setResults)
        .catch((e) => {
          console.error('Error searching for ticker:', e)
          setResults([])
        })
    }

    return { addTicker: doAddTicker, removeTicker, doSearch, updateColor }
  }

  const usePresenter = () => {
    const tickers = useTickerStore((s) => s.tickers)
    const withSharpe = tickers
      .filter((ticker) => ticker.sharpe)
      .map((ticker) => {
        // Keep only the first value if older multi-value strings are still present.
        const raw = ticker.sharpe!.split('/')[0].trim()
        const num = parseFloat(raw)
        const display = Number.isFinite(num) && num < 0 ? '0.00' : raw
        return { ...ticker, sharpe: display }
      })
    const withoutSharpe = tickers.filter((ticker) => !ticker.sharpe)
    withSharpe.sort((a, b) => parseFloat(b.sharpe!) - parseFloat(a.sharpe!))
    const sorted = [...withSharpe, ...withoutSharpe]
    const pendingCount = sorted.filter((t) => !t.sharpe).length
    const hasAnySeries = sorted.some(
      (t) => t.sharpeTimeSeries && t.sharpeTimeSeries.dates.length > 0
    )

    return {
      tickers: sorted,
      results,
      chart: {
        tickers: sorted,
        isLoading: pendingCount > 0 && !hasAnySeries,
        isPartialLoading: pendingCount > 0 && hasAnySeries,
      },
    }
  }

  return { useController, usePresenter }
}
