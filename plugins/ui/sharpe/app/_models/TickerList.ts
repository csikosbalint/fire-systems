import { useState } from 'react'
import { Ticker } from '@shared/types/Ticker'
import { search, download } from '@adapters/server/TickerOps'
import { mysharpe } from '@adapters/browser/QuoteCalculator'

export default function useTickerListModels() {
  // models for the view
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [found, setFound] = useState<Ticker | null>(null)

  const addTicker = async ({ ticker }: { ticker: Ticker }): Promise<void> => {
    download({ ticker })
      .then((data) =>
        mysharpe({
          data,
          lookback: 125,
          ticker: ticker.ticker,
        })
      )
      .then((data) => {
        console.log('Sharpe enrichment completed for ticker:', ticker.ticker)
        console.log('Enriched data sample:', data) // Log a sample of the enriched data
        ticker.sharpe = `${[1, 5, 10, 20].map((days) => data[data.length - days].sharpeRatio?.toFixed(2)).join(' / ')}` // Use the latest sharpe ratio
        setTickers((prev) => [...prev, ticker])
      })
      .catch((e) => {
        console.error('Error downloading data for ticker:', e)
      })
  }

  const doSearch = async (keyword: string) => {
    setFound(null) // Clear previous search result
    if (keyword.trim() === '') {
      setFound(null)
      return
    }
    return search(keyword)
      .then((result) => {
        setFound(result)
      })
      .catch((e) => {
        console.error('Error searching for ticker:', e)
        setFound(null)
      })
  }

  return {
    tickers,
    addTicker,
    found,
    doSearch,
  }
}
