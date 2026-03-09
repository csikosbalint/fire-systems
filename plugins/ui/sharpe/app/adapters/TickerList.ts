import { useState } from 'react'
import { Ticker } from '@shared/Ticker'
import {
  HistoricalDataEventNames,
  useHistoricalDataRetrieverPort,
} from 'fire-app/ports'

export default function useTickerListAdapter() {
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [found, setFound] = useState<Ticker | null>(null)
  const { retriever } = useHistoricalDataRetrieverPort()

  const useController = () => {
    const search = (keyword: string): void => {
      setFound(null) // Clear previous search result
      retriever.search(keyword)
    }

    const addTicker = (ticker: Ticker): void => {
      setTickers((prev) => [...prev, ticker])
    }

    retriever.subscribe(
      HistoricalDataEventNames.FOUND,
      (eventData: unknown) => {
        const ticker = (eventData as unknown as { ticker: string }).ticker
        setFound({ isin: ticker, name: '' }) // Replace '' with actual name if available
      }
    )

    retriever.subscibe(HistoricalDataEventNames.NOT_FOUND, () => {
      console.log('Ticker not found')
    })

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
