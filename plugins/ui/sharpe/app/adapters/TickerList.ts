import { useState } from 'react'
import { Ticker } from '@shared/Ticker'

// Placeholder ticker lookup logic - will be replaced with real API call later
const placeholderLookup: Record<string, string> = {
  US0378331005: 'Apple Inc.',
  US5949181045: 'Microsoft Corporation',
  US02079K3059: 'Alphabet Inc. Class A',
  US88160R1014: 'Tesla Inc.',
  US0231351067: 'Amazon.com Inc.',
}

export default function useTickerListAdapter() {
  const [tickers, setTickers] = useState<Ticker[]>([])

  const useController = () => {
    const searchByISIN = (isin: string): Ticker | null => {
      const name = placeholderLookup[isin.toUpperCase()]
      return name ? { isin, name } : null
    }

    const addTicker = (ticker: Ticker) => {
      setTickers((prev) => [...prev, ticker])
    }

    return {
      searchByISIN,
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
