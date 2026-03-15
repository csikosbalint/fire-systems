import type { HistoricalData, MySharpeEvent } from '@ports/types.js'
import { Transformer } from './Transformer.js'
import { Validator } from './Validator.js'
import type { IEventBus } from '@shared/IEventBus.js'
import type { Logger } from 'yahoo-finance2/lib/options'
import { MySharpeEventNames } from '@ports/events.js'

export class MySharpe {
  private namespace = 'MySharpe'
  private eventBus: IEventBus
  private logger: Logger
  
  async augment({ data, lookback }: { data: HistoricalData[], lookback: number }) {
    // check if data has enough points for lookback
    if (!Validator.hasEnoughData(data, 2 * lookback)) {
      throw new Error('Not enough data for lookback')
    }
    // add profits to data
    return Transformer.addProfits(data, lookback)
      // .then(() => Transformer.addDeviationOfProfits(data, lookback))
      // .then(() => Transformer.addSharpeRatio(data))
      .then(() => {
        this.eventBus.publish(`${this.namespace}::${MySharpeEventNames.COMPLETED}`, { data })
        return data
      })
  }
  
  constructor(
    { eventBus, logger}: { eventBus: IEventBus, logger: Logger ,data: HistoricalData[], ticker: string, lookback?: number }
  ) {
    this.eventBus = eventBus
    this.logger = logger
    
  }

  subscribe(event: MySharpeEvent, callback: (data: HistoricalData) => void): void {
    this.eventBus.subscribe(`${this.namespace}::${event}`, callback as (data: unknown) => void)
  }
}