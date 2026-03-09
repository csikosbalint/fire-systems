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
    const { retriever } = useHistoricalDataRetrieverPort()
    expect(retriever).toBeDefined()
    const ret = new Promise<void>((resolve) => {
      retriever.subscribe(HistoricalDataEventNames.COMPLETED, (eventData: HistoricalData) => {
        const data = (eventData as unknown as { data: HistoricalData[] }).data
        expect(data).toBeDefined()
        // today
        const last = data.find((d: HistoricalData) => d.date === '2026-03-05')
        expect(last?.close).toBeCloseTo(260.29, 2)
        const first = data.find((d: HistoricalData) => d.date === '2026-01-02')
        expect(first?.close).toBeCloseTo(271.01, 2)
        resolve()
      })
    })
    retriever.retrieve({
      ticker: 'AAPL',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-06'),
    })
    return ret
  })

  it('should handle error when downloading historical data', async () => {
    const { retriever } = useHistoricalDataRetrieverPort()
    expect(retriever).toBeDefined()
    const ret = new Promise<void>((resolve) => {
      retriever.subscribe(HistoricalDataEventNames.ERROR, (eventData: unknown) => {
        const error = (eventData as unknown as { error: unknown }).error
        expect(error).toBeDefined()
        resolve()
      })
    })
    retriever.retrieve({
      ticker: 'INVALID_TICKER',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-06'),
    })
    return ret
  })

  it('should seek and find ticker by keyword', async () => {
    const { retriever } = useHistoricalDataRetrieverPort()
    const ret = new Promise<void>((resolve) => {
      retriever.subscribe(HistoricalDataEventNames.FOUND, (eventData: unknown) => {
        expect((eventData as unknown as { ticker: string }).ticker).toBe('AAPL')
        resolve()
      })
    })
    retriever.search('US0378331005')
    return ret
  })

  it('should seek and not find ticker by invalid keyword', async () => {
    const { retriever } = useHistoricalDataRetrieverPort()
    const ret = new Promise<void>((resolve) => {
      retriever.subscribe(HistoricalDataEventNames.NOT_FOUND, (eventData: unknown) => {
        expect((eventData as unknown as { keyword: string }).keyword).toBe('INVALID_KEYWORD')
        resolve()
      })
    })
    retriever.search('INVALID_KEYWORD')
    return ret
  })
})