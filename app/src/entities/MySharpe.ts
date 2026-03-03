import { Transformer } from './Transformer.js'
import { Validator } from './Validator.js'
import { MySharpeEventNames } from '../ports/events.js'
import type { HistoricalData, MySharpeEvent } from '../ports/types.js'
import type { IEventBus } from '../shared/IEventBus.js'
import type { Logger } from '../shared/Logger.js'

export class MySharpe {
  private namespace = 'MySharpe'
  private eventBus: IEventBus
  private data: HistoricalData[]
  private ticker: string
  private lookback: number
  private logger: Logger
  
  async calculate() {
    // add profits to data
    Transformer.addProfits(this.data, this.lookback)
    // add deviation of profits to data
    Transformer.addDeviationOfProfits(this.data, this.lookback)
    Transformer.addSharpeRatio(this.data)
    this.eventBus.publish(`${this.namespace}::${MySharpeEventNames.COMPLETED}`, { ticker: this.ticker, data: this.data })
    return
  }
  
  constructor(
    { eventBus, logger, data, ticker, lookback = 250 }: { eventBus: IEventBus, logger: Logger ,data: HistoricalData[], ticker: string, lookback?: number }
  ) {
    this.eventBus = eventBus
    this.data = data
    this.ticker = ticker
    this.lookback = lookback
    this.logger = logger
    this.namespace += `::${ticker}`
    // check if data has enough points for lookback
    if (!Validator.hasEnoughData(data, 2 * lookback)) {
      throw new Error('Not enough data for lookback')
    }
    this.logger.info(`MySharpe initialized for ${ticker} with lookback ${lookback}`)
  }

  subscribe(event: MySharpeEvent, callback: (data: HistoricalData) => void): void {
    this.eventBus.subscribe(`${this.namespace}::${event}`, callback as (data: unknown) => void)
  }
}