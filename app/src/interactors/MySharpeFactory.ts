import { MySharpe } from '../entities/MySharpe.js'
import { Logger } from '../shared/Logger.js'
import type { HistoricalData } from '../ports/types.js'
import type { IEventBus } from '../shared/IEventBus.js'

export default class MySharpeFactory {
    private eventBus: IEventBus
    private logger: Logger
    constructor({ eventBus, logger }: { eventBus: IEventBus, logger: Logger }) {
        this.eventBus = eventBus
        this.logger = logger

        this.logger.info('MySharpeFactory initialized')
        
    }

    create({ ticker, data, lookback = 250 }: {
        ticker: string, data: HistoricalData[], lookback?: number
    }): MySharpe {
        return new MySharpe({ eventBus: this.eventBus, logger: this.logger, ticker, data, lookback })
    }
}