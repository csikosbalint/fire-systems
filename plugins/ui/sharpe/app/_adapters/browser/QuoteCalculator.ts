'use client'

import {
  EnrichmentEventNames,
  HistoricalData,
  mySharpePort,
} from '@csikosbalint/fire-app/ports'

export async function calculateMySharpe({
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
      resolve(data)
    })
    subscribe(EnrichmentEventNames.ERROR, (event) => {
      const { ticker, message } = event as unknown as {
        ticker: string
        message: string
      }
      reject({ message, ticker })
    })
  })
  augment({
    data,
    lookback,
    ticker,
  }).catch((error) => {
    console.warn('Some error happened. Please see logs for details:', error)
  })
  return ret
}
