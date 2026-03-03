import type { HistoricalData } from '../ports/types.js'
import { calculateStandardDeviation } from '@railpath/finance-toolkit'
export class Transformer {
    static addProfits(data: HistoricalData[], lookback: number): void {
        data.forEach((item, index) => {
        if (index < lookback) return
            const previous = data[index - lookback]
            if (!previous) return
            item.profit = (item.close - previous.close) / previous.close
        })
    }
    static addDeviationOfProfits(data: HistoricalData[], lookback: number): void {
        data.forEach((item, index) => {
            if (item.profit === undefined) return
            item.deviationOfProfit = this.calculateDeviation(data.slice(index - lookback, index).map(d => d.profit))
        })
    }
    static calculateDeviation(data: (number | undefined)[]): number | undefined {
        if (data.some(d => d === undefined)) return undefined
        // calculate standard deviation of data
        return calculateStandardDeviation(data as number[])
    }
    static addSharpeRatio(data: HistoricalData[]): void {
        data.forEach((item) => {
            if (item.profit === undefined || item.deviationOfProfit === undefined) return
            item.sharpeRatio = item.profit / item.deviationOfProfit
        })
    }
}