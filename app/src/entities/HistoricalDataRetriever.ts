import type { HistoricalData, HistoricalDataEvent } from '@ports/types.js'
import type { IEventBus } from '@shared/IEventBus.js'
import type { Logger } from '@shared/Logger.js'

export class HistoricalDataRetriever {
    private namespace = 'HistoricalDataRetriever'
    private eventBus: IEventBus
    private logger: Logger
    private ticker: string

    constructor(
        { eventBus, logger, ticker}: { eventBus: IEventBus, logger: Logger, ticker: string,}
    ) {
        this.eventBus = eventBus
        this.logger = logger
        this.ticker = ticker
    }

    retrieve(): HistoricalData[] {
        return []
    }

    subscribe(event: HistoricalDataEvent, callback: (data: HistoricalData) => void): void {
        this.eventBus.subscribe(`${this.namespace}::${event}`, callback as (data: unknown) => void)
    }

}