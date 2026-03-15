'use server'
import { Ticker } from '@shared/types/Ticker'
import {
  HistoricalData,
  HistoricalDataEventNames,
  SearchEventNames,
} from 'fire-app/ports'

import { tickerSearchPort, historicalDataPort } from 'fire-app/ports/server'

export async function search(keyword: string): Promise<Ticker | null> {
  const { search, subscribe } = tickerSearchPort()
  const ret = new Promise<Ticker | null>((resolve) => {
    // Subscribe to search results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribe(SearchEventNames.FOUND, (data: any) => {
      if (data.quotes && data.quotes.length === 1) {
        resolve({
          market: data.quotes[0].exchDisp,
          ticker: data.quotes[0].symbol,
          name:
            data.quotes[0].longname ||
            data.quotes[0].shortname ||
            data.quotes[0].symbol,
        })
      } else {
        resolve(null)
      }
    })
    subscribe(SearchEventNames.NOT_FOUND, () => {
      resolve(null)
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
    subscribe(HistoricalDataEventNames.COMPLETED, (data) => {
      console.log('Historical data retrieved:', data)
      resolve(data as HistoricalData[])
    })
    subscribe(HistoricalDataEventNames.ERROR, (error) => {
      console.error('Error retrieving historical data:', error)
      reject(error)
    })
  })

  retrieve({ ticker: ticker.ticker, startDate, endDate })

  return ret
}
