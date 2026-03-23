'use server'
import { Ticker } from '@shared/types/Ticker'
import { HistoricalData, SearchEventNames } from '@csikosbalint/fire-app/ports'

import {
  tickerSearchPort,
  historicalDataPort,
} from '@csikosbalint/fire-app/ports/server'

export async function search(keyword: string): Promise<Ticker[]> {
  const { search, subscribe } = tickerSearchPort()
  const ret = new Promise<Ticker[]>((resolve) => {
    // Subscribe to search results
    subscribe(SearchEventNames.FOUND, (event) => {
      const { result } = event as unknown as {
        result: {
          quotes: {
            symbol: string
            exchDisp: string
            longname?: string
            shortname?: string
            quoteType: string
          }[]
        }
      }
      if (result.quotes && result.quotes.length > 0) {
        resolve(
          result.quotes.map((q) => ({
            market: q.exchDisp,
            ticker: q.symbol,
            name: q.longname || q.shortname || q.symbol,
            type: q.quoteType,
          }))
        )
      } else {
        resolve([])
      }
    })
    subscribe(SearchEventNames.NOT_FOUND, () => {
      resolve([])
    })
  })
  search(keyword)
  return ret
}

export async function download({
  ticker,
}: {
  ticker: Ticker
}): Promise<HistoricalData[]> {
  const { retrieve } = historicalDataPort()
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 2) // 2 years ago
  const endDate = new Date()

  return retrieve({ ticker: ticker.ticker, startDate, endDate })
}
