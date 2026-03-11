import { useState } from 'react'
import { Ticker } from '@shared/Ticker'

export default function useTickerListAdapter() {
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [found, setFound] = useState<Ticker | null>(null)

  const useController = () => {
    const search = (keyword: string): void => {
      setFound(null) // Clear previous search result
      setFound({
        isin: 'US0378331005',
        name: 'Apple Inc.',
        price: 150.25,
      }) // Mocked search result for demonstration
    }

    const addTicker = (ticker: Ticker): void => {
      setTickers((prev) => [...prev, ticker])
    }

    return {
      search,
      found,
      addTicker,
    }
  }

  const usePresenter = () => {
    return {
      tickers,
    }
  }

  return {
    useController,
    usePresenter,
  }
}
