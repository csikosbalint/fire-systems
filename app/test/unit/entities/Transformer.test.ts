import { describe, it, expect, beforeEach } from 'vitest'
import { Transformer } from '../../../src/entities/Transformer.js'
import type { HistoricalData } from '../../../src/ports/types.js'
import stdData from '../../fixtures/stddata.json'

describe('Transformer Entity', () => {
  let testData: HistoricalData[]

  beforeEach(() => {
    testData = [
      { date: '2024-01-01', close: 100 },
      { date: '2024-01-02', close: 102 },
      { date: '2024-01-03', close: 105 },
      { date: '2024-01-04', close: 103 },
      { date: '2024-01-05', close: 108 },
    ]
  })

  describe('addProfits', () => {
    it('should add profit calculation to data points after lookback period', () => {
      const lookback = 2
      Transformer.addProfits(testData, lookback)

      expect(testData[0].profit).toBeUndefined()
      expect(testData[1].profit).toBeUndefined()
      expect(testData[2].profit).toBeCloseTo(0.05) // (105 - 100) / 100
      expect(testData[3].profit).toBeCloseTo(0.0098, 4) // (103 - 102) / 102
      expect(testData[4].profit).toBeCloseTo(0.0286, 4) // (108 - 105) / 105
    })

    it('should handle lookback of 1', () => {
      const lookback = 1
      Transformer.addProfits(testData, lookback)

      expect(testData[0].profit).toBeUndefined()
      expect(testData[1].profit).toBeCloseTo(0.02) // (102 - 100) / 100
      expect(testData[2].profit).toBeCloseTo(0.0294, 4) // (105 - 102) / 102
    })

    it('should not modify data when lookback exceeds data length', () => {
      const lookback = 10
      Transformer.addProfits(testData, lookback)

      testData.forEach((item) => {
        expect(item.profit).toBeUndefined()
      })
    })
  })

  describe('calculateDeviation', () => {
    it('should calculate standard deviation for valid data', () => {
      const data = [1, 2, 3, 4, 5]
      const result = Transformer.calculateDeviation(data)

      expect(result).toBeDefined()
      expect(result).toBeCloseTo(1.5811, 4) // Standard deviation of [1,2,3,4,5] is ~1.5811
    })
      
    it('should calculate verified standard deviation for known data', () => {
        const data = [
        11.62,
        11.90,
        11.82,
        11.54,
        11.15,
        11.13,
        11.04,
        10.97,
        10.89,
        10.91
    ]
    const result = Transformer.calculateDeviation(data)

    expect(result).toBeDefined()
    expect(result).toBeCloseTo(0.3852188752,2) // Standard deviation of [11.62, 11.90, ..., 10.91] is ~0.003852188752
    })

    it('should calculate verified standard deviation for known data 2', () => {
    const data = stdData as number[]
    const result = Transformer.calculateDeviation(data)

    expect(result).toBeDefined()
    expect(result).toBeCloseTo(1.71657,2) // Standard deviation of [11.62, 11.90, ..., 10.91] is ~0.003852188752
    })

    it('should return undefined when data contains undefined values', () => {
      const data = [1, 2, undefined, 4, 5]
      const result = Transformer.calculateDeviation(data)

      expect(result).toBeUndefined()
    })

    it('should handle empty array', () => {
      const data: number[] = []
      const result = Transformer.calculateDeviation(data)

      expect(result).toBeUndefined()
    })
  })

  describe('addDeviationOfProfits', () => {
    it('should add deviation of profits when profits exist', () => {
      const lookback = 2
      Transformer.addProfits(testData, lookback)
      Transformer.addDeviationOfProfits(testData, lookback)

      expect(testData[2].deviationOfProfit).toBeUndefined() // Not enough lookback
      expect(testData[3].deviationOfProfit).toBeUndefined() // Not enough lookback
      expect(testData[4].deviationOfProfit).toBeDefined()
    })

    it('should skip data points without profit', () => {
      const lookback = 1
      Transformer.addDeviationOfProfits(testData, lookback)

      testData.forEach((item) => {
        expect(item.deviationOfProfit).toBeUndefined()
      })
    })
  })

  describe('addSharpeRatio', () => {
    it('should calculate Sharpe ratio when profit and deviation exist', () => {
      testData[2].profit = 0.05
      testData[2].deviationOfProfit = 0.01

      Transformer.addSharpeRatio(testData)

      expect(testData[2].sharpeRatio).toBeCloseTo(5.0)
    })

    it('should not calculate Sharpe ratio when profit is missing', () => {
      testData[2].deviationOfProfit = 0.01

      Transformer.addSharpeRatio(testData)

      expect(testData[2].sharpeRatio).toBeUndefined()
    })

    it('should not calculate Sharpe ratio when deviation is missing', () => {
      testData[2].profit = 0.05

      Transformer.addSharpeRatio(testData)

      expect(testData[2].sharpeRatio).toBeUndefined()
    })

    it('should handle division by deviation across multiple data points', () => {
      testData.forEach((item, i) => {
        if (i > 1) {
          item.profit = 0.02 * i
          item.deviationOfProfit = 0.01
        }
      })

      Transformer.addSharpeRatio(testData)

      expect(testData[0].sharpeRatio).toBeUndefined()
      expect(testData[1].sharpeRatio).toBeUndefined()
      expect(testData[2].sharpeRatio).toBeCloseTo(4.0)
      expect(testData[3].sharpeRatio).toBeCloseTo(6.0)
      expect(testData[4].sharpeRatio).toBeCloseTo(8.0)
    })
  })
})
