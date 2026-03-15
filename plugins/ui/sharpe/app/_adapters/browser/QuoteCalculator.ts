'use client'

import {
  EnrichmentEventNames,
  HistoricalData,
  mySharpePort,
} from 'fire-app/ports'

export async function mysharpe({
  data,
  lookback,
}: {
  data: HistoricalData[]
  lookback: number
}) {
  const { subscribe, augment } = mySharpePort()
  subscribe(EnrichmentEventNames.COMPLETED, (result) => {
    console.log('Enrichment completed with result:', result)
  })
  augment({
    data,
    lookback,
  })
}
