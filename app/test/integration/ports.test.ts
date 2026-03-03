import { describe, expect, it } from 'vitest'
import { CounterEventNames, MySharpeEventNames, useCounterPort, useMySharpePort } from '../../src/ports/index.js'
import testdata from '../fixtures/test.json'
import { HistoricalData } from '../../src/ports/types.js'

describe('Counter', () => {
  it('should expose counter port to an adapter, and increase counter', () => {
    const { counter, increment, subscribe } = useCounterPort()
    expect(counter).toBe(0)
    subscribe(CounterEventNames.UPDATE, (data) => {
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
    mySharpe?.subscribe(MySharpeEventNames.COMPLETED, (eventData) => {
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