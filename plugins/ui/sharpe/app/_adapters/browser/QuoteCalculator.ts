'use client'

import {
  EnrichmentEventNames,
  HistoricalData,
  mySharpePort,
} from 'fire-app/ports'

export async function mysharpe({
  data,
  lookback,
  ticker,
}: {
  data: HistoricalData[]
  lookback: number
  ticker: string
}) {
  const { subscribe, augment } = mySharpePort()
  const ret = new Promise<HistoricalData[]>((resolve, reject) => {
    subscribe(EnrichmentEventNames.COMPLETED, (event) => {
      const { ticker, data } = event as {
        ticker: string
        data: HistoricalData[]
      }
      if (ticker !== ticker) return
      console.log('Enrichment completed with result:', { ticker, data })
      resolve(data)
    })
    subscribe(EnrichmentEventNames.ERROR, (event) => {
      const error = (event as unknown as { error: unknown }).error
      console.error('Error during enrichment:', error)
      reject(error)
    })
  })
  augment({
    data,
    lookback,
    ticker,
  })
  return ret
}
