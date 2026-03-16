import { beforeEach, describe, expect, it } from 'vitest'
import testData from '../../fixtures/test.json'
import { HistoricalData } from '../../../src/ports/types.js'
import { createMockEventBus, createMockLogger } from '../../helpers/mocks.js'
import { MySharpe } from '../../../src/entities/MySharpe.js'
import { MySharpeEventNames } from '../../../src/ports/index.js'

describe('MysSharpe', () => {
    let mockEventBus: ReturnType<typeof createMockEventBus>
    let mockLogger: ReturnType<typeof createMockLogger>
    let mySharpe: any
    beforeEach(() => {
        mockEventBus = createMockEventBus()
        mockLogger = createMockLogger()
    })
    
    it('should perform expected behavior for known data and 250 fiscal days lookback', async () => {
        // Arrange
        const data = testData as unknown as HistoricalData[]
        const lookback = 250
        mySharpe = new MySharpe({ eventBus: mockEventBus, logger: mockLogger as never})
        expect(mySharpe).toBeDefined()
        // Act
        const ticker = 'test'
        const result = await mySharpe.augment({ data, lookback, ticker })
        // Assert
        expect(mockEventBus.publish).toBeCalled()//.toHaveBeenCalledWith('MySharpe::TEST::completed', expect.objectContaining({ ticker: 'TEST', data: expect.any(Array) }))
        // today
        expect(result.find((d: HistoricalData) => d.date === '11-14-2013').sharpeRatio).toBeCloseTo(5.46, 1)
        // week ago
        expect(result.find((d: HistoricalData) => d.date === '11-8-2013').sharpeRatio).toBeCloseTo(5.23, 1)
        // month ago
        expect(result.find((d: HistoricalData) => d.date === '10-15-2013').sharpeRatio).toBeCloseTo(5.06, 1)
        // quarter ago
        expect(result.find((d: HistoricalData) => d.date === '8-14-2013').sharpeRatio).toBeCloseTo(3.41, 1)
        // semiannual ago
        expect(result.find((d: HistoricalData) => d.date === '5-17-2013').sharpeRatio).toBeCloseTo(2.37, 1)
        // year ago
        expect(result.find((d: HistoricalData) => d.date === '11-13-2012').sharpeRatio).toBeCloseTo(1.81, 1)
        // 2 years ago
        expect(result.find((d: HistoricalData) => d.date === '11-14-2011').sharpeRatio).toBeCloseTo(0.66, 1)
    })

    it('should perform expected behavior for known data and 125 fiscal days lookback', async () => {
        // Arrange
        const data = testData as unknown as HistoricalData[]
        const lookback = 125
        const ticker = 'test'
        mySharpe = new MySharpe({ eventBus: mockEventBus, logger: mockLogger as never})
        expect(mySharpe).toBeDefined()
        // Act
        const result = await mySharpe.augment({ data, lookback, ticker })
        // Assert
        expect(mockEventBus.publish).toHaveBeenCalledWith(`MySharpe::${MySharpeEventNames.COMPLETED}`, expect.objectContaining({ ticker: 'test', data: expect.any(Array) }))
        // today
        expect(result.find((d: HistoricalData) => d.date === '11-14-2013').sharpeRatio).toBeCloseTo(3.06, 1)
        // week ago
        expect(result.find((d: HistoricalData) => d.date === '11-8-2013').sharpeRatio).toBeCloseTo(3.33, 1)
        // month ago
        expect(result.find((d: HistoricalData) => d.date === '10-15-2013').sharpeRatio).toBeCloseTo(3.91, 1)
        // quarter ago
        expect(result.find((d: HistoricalData) => d.date === '8-14-2013').sharpeRatio).toBeCloseTo(1.37, 1)
        // semiannual ago
        expect(result.find((d: HistoricalData) => d.date === '5-17-2013').sharpeRatio).toBeCloseTo(1.95, 1)
        // year ago
        expect(result.find((d: HistoricalData) => d.date === '11-13-2012').sharpeRatio).toBeCloseTo(3.19, 1)
    })
})