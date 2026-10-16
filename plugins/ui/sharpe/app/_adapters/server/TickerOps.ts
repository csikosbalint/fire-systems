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

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export async function download({
  ticker,
  startDate,
  endDate,
}: {
  ticker: Ticker
  startDate?: Date
  endDate?: Date
}): Promise<HistoricalData[]> {
  const { retrieve } = historicalDataPort()
  const requestedStartDate = startDate ?? new Date()
  if (!startDate) requestedStartDate.setFullYear(requestedStartDate.getFullYear() - 2)
  // Yahoo treats the end date as exclusive, so ask for one day ahead to include today's bar
  const requestedEndDate = endDate ?? new Date(Date.now() + ONE_DAY_MS)

  return retrieve({
    ticker: ticker.ticker,
    startDate: requestedStartDate,
    endDate: requestedEndDate,
  })
}
