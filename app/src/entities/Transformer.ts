import type { HistoricalData } from '../ports/types.js'

export class Transformer {
    static async addProfits(data: HistoricalData[], lookback: number): Promise<HistoricalData[]> {
        const copyOfData = JSON.parse(JSON.stringify(data)) as HistoricalData[]
        return copyOfData.map((item, index): HistoricalData=> {
            if (index < lookback) return item
            const previous = copyOfData[index - lookback]
            if (!previous) return item
            item.profit = (item.close - previous.close) / previous.close
            return item
        })
    }
    static async addDeviationOfProfits(data: HistoricalData[], lookback: number): Promise<HistoricalData[]> {
        const copyOfData = JSON.parse(JSON.stringify(data)) as HistoricalData[]
        return copyOfData.map((item, index) => {
            if (item.profit === undefined) return item
            item.deviationOfProfit = this.calculateDeviation(copyOfData.slice(index - lookback, index).map(d => d.profit).filter(d => d !== undefined) as number[])
            return item
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
    static async addSharpeRatio(data: HistoricalData[]): Promise<HistoricalData[]> {
        const copyOfData = JSON.parse(JSON.stringify(data)) as HistoricalData[]
        return copyOfData.map((item) => {
            if (item.profit === undefined || item.deviationOfProfit === undefined) return item
            item.sharpeRatio = item.profit / item.deviationOfProfit
            return item
        })
    }
}