'use server'
import { Ticker } from '@shared/types/Ticker'
import {
  HistoricalData,
  HistoricalDataEventNames,
  SearchEventNames,
} from 'fire-app/ports'

import { tickerSearchPort, historicalDataPort } from 'fire-app/ports/server'

export async function search(keyword: string): Promise<Ticker[]> {
  const { search, subscribe } = tickerSearchPort()
  const ret = new Promise<Ticker[]>((resolve) => {
    // Subscribe to search results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribe(SearchEventNames.FOUND, (event) => {
      const { result } = event as unknown as {
        result: {
          quotes: {
            symbol: string
            exchDisp: string
            longname?: string
            shortname?: string
          }[]
        }
      }
      if (result.quotes && result.quotes.length > 0) {
        resolve(
          result.quotes.map((q) => ({
            market: q.exchDisp,
            ticker: q.symbol,
            name: q.longname || q.shortname || q.symbol,
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
  const { subscribe, retrieve } = historicalDataPort()
  const startDate = new Date()
  startDate.setFullYear(startDate.getFullYear() - 1) // 1 year ago
  const endDate = new Date()

  const ret = new Promise<HistoricalData[]>((resolve, reject) => {
    subscribe(HistoricalDataEventNames.COMPLETED, (event) => {
      const data = (event as unknown as { data: HistoricalData[] }).data
      console.log('Historical data retrieved:', data.length, 'records')
      resolve(data as HistoricalData[])
    })
    subscribe(HistoricalDataEventNames.ERROR, (event) => {
      const error = (event as unknown as { error: unknown }).error
      console.error('Error retrieving historical data:', error)
      reject(error)
    })
  })

  retrieve({ ticker: ticker.ticker, startDate, endDate })

  return ret
}
