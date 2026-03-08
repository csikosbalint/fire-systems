import { describe, expect, it } from 'vitest'
import { CounterEventNames, MySharpeEventNames, HistoricalDataEventNames, useCounterPort, useMySharpePort, HistoricalData, useHistoricalDataRetrieverPort } from '@ports/index.js'
import testdata from '../fixtures/test.json'

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

describe('HistoricalDataRetrieverFactory', () => {
  it('should create HistoricalDataRetriever instance', () => {
    const { retriever, retrieverError } = useHistoricalDataRetrieverPort({ ticker: 'AAPL' })
    expect(retrieverError).toBeUndefined()
    expect(retriever).toBeDefined()
    retriever.subscribe(HistoricalDataEventNames.COMPLETED, (eventData: HistoricalData) => {
      const data = (eventData as unknown as { data: HistoricalData[] }).data
      expect(data).toBeDefined()
      // today
      const today = data.find((d: HistoricalData) => d.date === '11-14-2013')
      expect(today).toBeDefined()
      expect(today?.sharpeRatio).toBeCloseTo(3.06, 1)
    })
    retriever.retrieve()
  })
})