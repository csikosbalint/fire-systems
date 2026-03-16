import type { HistoricalData } from '../ports/types.js'

export class Transformer {
    static async addProfits(data: HistoricalData[], lookback: number) {
        data.forEach((item, index) => {
        if (index < lookback) return
            const previous = data[index - lookback]
            if (!previous) return
            item.profit = (item.close - previous.close) / previous.close
        })
    }
    static async addDeviationOfProfits(data: HistoricalData[], lookback: number): Promise<void> {
        data.forEach((item, index) => {
            if (item.profit === undefined) return
            item.deviationOfProfit = this.calculateDeviation(data.slice(index - lookback, index).map(d => d.profit).filter(d => d !== undefined) as number[])
        })
    }
    static calculateDeviation(data: (number[] | undefined)): number | undefined {
        if (
            data === undefined ||
            data.length < 2 ||
            data.some(d => d === undefined)) {
            return undefined
        } else {
            // calculate sample standard deviation of data
            const mean = data.reduce((sum, d) => sum + (d as number), 0) / data.length
            const variance = data.reduce((sum, d) => sum + Math.pow((d as number) - mean, 2), 0) / (data.length - 1)
            return Math.sqrt(variance)
        }
    }
    static async addSharpeRatio(data: HistoricalData[]): Promise<void> {
        data.forEach((item) => {
            if (item.profit === undefined || item.deviationOfProfit === undefined) return
            item.sharpeRatio = item.profit / item.deviationOfProfit
        })
    }
}