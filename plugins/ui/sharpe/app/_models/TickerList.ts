import { useEffect, useRef, useState } from 'react'
import { Ticker } from '@shared/types/Ticker'
import { search, download } from '@adapters/server/TickerOps'
import { mysharpe } from '@adapters/browser/QuoteCalculator'
import useTickerStore from './TickerStore'

export default function useTickerListAdapter() {
  const { addTicker, removeTicker, updateSharpe } = useTickerStore()
  const [results, setResults] = useState<Ticker[]>([])

  const fetchSharpe = (ticker: Ticker) =>
    download({ ticker })
      .then((data) => data.slice(0, -1)) // Exclude most recent day which may be incomplete
      .then((data) => mysharpe({ data, lookback: 125, ticker: ticker.ticker }))
      .then((data) => {
        const sharpe = `${[1, 5, 10, 20]
          .map((days) => data[data.length - days].sharpeRatio?.toFixed(2))
          .join(' / ')}`
        updateSharpe(ticker.ticker, sharpe)
      })
      .catch((e) => {
        console.error('Error computing sharpe for ticker:', ticker.ticker, e)
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

    return { addTicker: doAddTicker, removeTicker, doSearch }
  }

  const usePresenter = () => ({
    tickers: useTickerStore((s) => s.tickers),
    results,
  })

  return { useController, usePresenter }
}
