import { MySharpe } from '@entities/MySharpe.js'
import type { HistoricalData } from '@ports/types.js'
import FactoryBase from '@shared/FactoryBase.js'

export default class MySharpeFactory extends FactoryBase {

    create({ ticker, data, lookback = 250 }: {
        ticker: string, data: HistoricalData[], lookback?: number
    }): MySharpe {
        return new MySharpe({ eventBus: this.eventBus, logger: this.logger, ticker, data, lookback })
    }
}