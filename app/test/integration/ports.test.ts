import { describe, expect, it } from 'vitest'
import { CounterEventNames, MySharpeEventNames, HistoricalDataEventNames, SearchEventNames, useCounterPort, mySharpePort } from '../../src/ports/index'
import {  historicalDataPort, tickerSearchPort} from '../../src/ports/server/index'
import testdata from '../fixtures/test.json'
import { HistoricalData } from '../../src/ports/types'

describe('Counter', async () => {
  it('should expose counter port to an adapter, and increase counter', async () => {
    const { counter, increment, subscribe } = useCounterPort()
    expect(counter).toBe(0)
    const ret = new Promise<void>((resolve) => {
      subscribe(CounterEventNames.UPDATE, (data: unknown) => {
        expect(data).toBe(1)
        resolve()
      })
    })
    increment()
    return ret
  })
})

describe('MySharpe', async () => {
  it('should expose mySharpe port to an adapter, and create MySharpe instance', async () => {
    const data = testdata as unknown as HistoricalData[]
    const { augment, subscribe } = mySharpePort()
    expect(augment).toBeDefined()
    expect(subscribe).toBeDefined()
    const ret = new Promise<void>((resolve, reject) => {
      subscribe(MySharpeEventNames.COMPLETED, (eventData: unknown) => {
        const data = (eventData as unknown as { data: HistoricalData[] }).data
        expect(data).toBeDefined()
        // today
        const today = data.find((d: HistoricalData) => d.date === '11-14-2013')
        expect(today).toBeDefined()
        const sharpe = today?.sharpeRatio
        expect(sharpe).toBeCloseTo(3.06, 2)
        resolve()
      })
      subscribe(MySharpeEventNames.ERROR, (error: unknown) => {
        reject(error)
      })
    })
    augment({ data, lookback: 125 })
    return ret
  })
})

describe('DataRetriever', async () => {
  it('should download historical data', async () => {
    const { retrieve, subscribe } = historicalDataPort()
    expect(retrieve).toBeDefined()
    const ret = new Promise<void>((resolve, reject) => {
      subscribe(HistoricalDataEventNames.COMPLETED, (eventData: HistoricalData) => {
        const data = (eventData as unknown as { data: HistoricalData[] }).data
        expect(data).toBeDefined()
        // today
        const last = data.find((d: HistoricalData) => (d.date as Date).toISOString().startsWith('2026-03-05'))
        expect(last?.close).toBeCloseTo(260.29, 2)
        const first = data.find((d: HistoricalData) => (d.date as Date).toISOString().startsWith('2026-01-02'))
        expect(first?.close).toBeCloseTo(271.01, 2)
        resolve()
      })
      subscribe(HistoricalDataEventNames.ERROR, (error: unknown) => {
        reject(error)
      })
    })
    retrieve({
      ticker: 'AAPL',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-06'),
    })
    return ret
  })

  it('should handle download error', async () => {
    const { retrieve, subscribe } = historicalDataPort()
    expect(retrieve).toBeDefined()
    const ret = new Promise<void>((resolve) => {
      subscribe(HistoricalDataEventNames.ERROR, (eventData: unknown) => {
        const error = (eventData as unknown as { error: unknown }).error
        expect(error).toBeDefined()
        resolve()
      })
    })
    await retrieve({
      ticker: 'INVALID_TICKER',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-06'),
    })
    .catch(() => {
      // Expected to throw, but error is handled via event, so we catch to prevent unhandled rejection
    })
    return ret
  })

})

describe('TickerSearch', async () => {
  it('should expose tickerSearch port to an adapter, search for a ticker, and return results', async () => {
    const { search, subscribe } = tickerSearchPort()
    expect(search).toBeDefined()
    expect(subscribe).toBeDefined()

    const ret = new Promise<void>((resolve, reject) => {
      subscribe(SearchEventNames.FOUND, ({result}: { result: { quotes: { symbol: string }[] } }) => {
        expect(result).toBeDefined()
        expect(result.quotes).toBeDefined()
        const ppfb = result.quotes.find((q) => q.symbol === 'PPFB.DE')
        expect(ppfb).toBeDefined()
        resolve()
      })
      subscribe(SearchEventNames.ERROR, (error: unknown) => {
        reject(error)
      })
    })

    await search('PPFB.DE')
    return ret
  })
})