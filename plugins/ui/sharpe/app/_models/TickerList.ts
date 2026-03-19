import { useEffect, useRef, useState } from 'react'
import { Ticker } from '@shared/types/Ticker'
import { search, download } from '@adapters/server/TickerOps'
import { calculateMySharpe } from '@adapters/browser/QuoteCalculator'
import useTickerStore from './TickerStore'

export default function useTickerListAdapter() {
  const { addTicker, removeTicker, updateSharpe } = useTickerStore()
  const [results, setResults] = useState<Ticker[]>([])

  const fetchSharpe = (ticker: Ticker) =>
    download({ ticker })
      .then((data) => data.slice(0, -1)) // Exclude most recent day which may be incomplete
      .then((dataWithoutToday) =>
        calculateMySharpe({
          data: dataWithoutToday,
          lookback: 125,
          ticker: ticker.ticker,
        })
      )
      .then((dataWithSharpe) => {
        const sharpe = `${[1, 5, 10, 20]
          .map((days) =>
            dataWithSharpe[dataWithSharpe.length - days].sharpeRatio?.toFixed(2)
          )
          .join(' / ')}`
        updateSharpe(ticker.ticker, sharpe)
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

    return { addTicker: doAddTicker, removeTicker, doSearch }
  }

  const usePresenter = () => {
    const tickers = useTickerStore((s) => s.tickers)
    const withSharpe = tickers
      .filter((ticker) => ticker.sharpe)
      .map((ticker) => {
        const regExToReplaceNegativeValues = /-\d+\.\d+/g
        ticker.sharpe = ticker.sharpe!.replace(
          regExToReplaceNegativeValues,
          '0.00'
        )
        return ticker
      })
    const withoutSharpe = tickers.filter((ticker) => !ticker.sharpe)
    withSharpe.sort((a, b) => parseFloat(b.sharpe!) - parseFloat(a.sharpe!))
    return {
      tickers: [...withSharpe, ...withoutSharpe],
      results,
    }
  }

  return { useController, usePresenter }
}
