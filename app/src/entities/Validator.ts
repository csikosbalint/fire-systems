import type { HistoricalData } from '@ports/index.js'

export class Validator {
    static hasEnoughData({ what, data, lookback }: { what: string, data: HistoricalData[], lookback: number }): boolean {
        switch(what) {
            case 'sharpe':
                return data.length >= 2 * lookback
            default:
                return false
        }
    }
}

