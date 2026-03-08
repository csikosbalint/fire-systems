import { HistoricalDataRetriever } from '@entities/HistoricalDataRetriever.js'
import FactoryBase from '@shared/FactoryBase.js'

export default class HistoricalDataFactory extends FactoryBase {

    create({ ticker }: {
        ticker: string
    }): HistoricalDataRetriever {
        return new HistoricalDataRetriever({ eventBus: this.eventBus, logger: this.logger, ticker })
    }
}