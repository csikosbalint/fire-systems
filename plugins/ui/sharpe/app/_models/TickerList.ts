import { useState } from 'react'
import { Ticker } from '@shared/types/Ticker'
import { search, download } from '@adapters/server/TickerRead'
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
          lookback: 252,
        })
      )
      .catch((e) => {
        console.error('Error downloading data for ticker:', e)
      })
    setTickers((prev) => [...prev, ticker])
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
