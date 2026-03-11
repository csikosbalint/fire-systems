import { useState } from 'react'
import { Ticker } from '@shared/Ticker'
import { search } from '@adapters/ServerActions'

export default function useTickerListAdapter() {
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [found, setFound] = useState<Ticker | null>(null)

  const useController = () => {
    const tickerAdd = async (ticker: Ticker): Promise<void> => {
      setTickers((prev) => [...prev, ticker])
    }

    const keywordChange = async (keyword: string) => {
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
      keywordChange,
      tickerAdd,
    }
  }

  const usePresenter = () => {
    return {
      tickers,
      found,
    }
  }

  return {
    useController,
    usePresenter,
  }
}
