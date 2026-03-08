import { describe, expect, it } from 'vitest'
import { CounterEventNames, MySharpeEventNames, HistoricalDataEventNames, useCounterPort, useMySharpePort, useHistoricalDataRetrieverPort } from '../../src/ports/index'
import testdata from '../fixtures/test.json'
import { HistoricalData } from '../../src/ports/types'

describe('Counter', () => {
  it('should expose counter port to an adapter, and increase counter', () => {
    const { counter, increment, subscribe } = useCounterPort()
    expect(counter).toBe(0)
    subscribe(CounterEventNames.UPDATE, (data: unknown) => {
        expect(data).toBe(1)
    })
    increment()
  })
})

describe('MySharpe', () => {
  it('should expose mySharpe port to an adapter, and create MySharpe instance', () => {
    const data = testdata as unknown as HistoricalData[]
    const { mySharpe, mySharpeError } = useMySharpePort({ data, ticker: 'TEST', lookback: 125 })
    expect(mySharpe).toBeDefined()
    expect(mySharpeError).toBeUndefined()
    mySharpe?.subscribe(MySharpeEventNames.COMPLETED, (eventData: unknown) => {
      const data = (eventData as unknown as { data: HistoricalData[] }).data
      expect(data).toBeDefined()
      // today
      const today = data.find((d: HistoricalData) => d.date === '11-14-2013')
      expect(today).toBeDefined()
      const sharpe = today?.sharpeRatio
      expect(sharpe).toBeCloseTo(3.06, 1)
    })
    mySharpe?.calculate()
  })
})

describe('HistoricalDataRetrieverFactory', async () => {
  it('should create HistoricalDataRetriever instance and download historical data', () => {
    return new Promise<void>((resolve, reject) => {
      const { retriever, retrieverError } = useHistoricalDataRetrieverPort({ ticker: 'AAPL' })
      expect(retrieverError).toBeUndefined()
      expect(retriever).toBeDefined()
      retriever.subscribe(HistoricalDataEventNames.COMPLETED, (eventData: HistoricalData) => {
        const data = (eventData as unknown as { data: HistoricalData[] }).data
        expect(data).toBeDefined()
        // today
        const today = data.find((d: HistoricalData) => d.date === '2026-03-05')
        expect(today).toBeDefined()
        expect(today?.close).toBeCloseTo(260.29, 1)
        resolve()
      })
      retriever.subscribe(HistoricalDataEventNames.ERROR, (eventData: unknown) => {
        const error = (eventData as unknown as { error: string }).error
        expect(error).toBeUndefined()
        reject()
      })
      retriever.retrieve({
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-06'),
      })
    })
  })
})