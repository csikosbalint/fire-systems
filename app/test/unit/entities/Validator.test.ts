import { describe, it, expect } from 'vitest'
import { Validator } from '../../../src/entities/Validator.js'

describe('Validator Entity', () => {
  describe('hasEnoughData', () => {
    it('should return true when data length equals lookback', () => {
      const data = [1, 2, 3, 4, 5]
      const lookback = 5

      expect(Validator.hasEnoughData(data, lookback)).toBe(true)
    })

    it('should return true when data length exceeds lookback', () => {
      const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const lookback = 5

      expect(Validator.hasEnoughData(data, lookback)).toBe(true)
    })

    it('should return false when data length is less than lookback', () => {
      const data = [1, 2, 3]
      const lookback = 5

      expect(Validator.hasEnoughData(data, lookback)).toBe(false)
    })

    it('should return true when data is empty and lookback is 0', () => {
      const data: unknown[] = []
      const lookback = 0

      expect(Validator.hasEnoughData(data, lookback)).toBe(true)
    })

    it('should handle large datasets correctly', () => {
      const data = Array(1000).fill(0)
      const lookback = 500

      expect(Validator.hasEnoughData(data, lookback)).toBe(true)
    })
  })
})
