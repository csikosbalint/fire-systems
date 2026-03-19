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

  constructor(
    { eventBus, logger}: { eventBus: IEventBus, logger: Logger }
  ) {
    this.eventBus = eventBus
    this.logger = logger
    
  }
  
  async augment({ data, lookback, ticker ='unknown' }: { data: HistoricalData[], lookback: number, ticker?: string }): Promise<HistoricalData[]> {
    // check if data has enough points for lookback
    if (!Validator.hasEnoughData({what: 'sharpe', data, lookback})) {
      throw new Error('Not enough data for lookback')
    }
    // add profit, deviation of profit, and sharpe ratio to data
    return Transformer.addProfits(data, lookback)
      .then((dataWithProfits) => Transformer.addDeviationOfProfits(dataWithProfits, lookback))
      .then((dataWithDeviation) => Transformer.addSharpeRatio(dataWithDeviation))
      .then((dataWithSharpe) => {
        this.eventBus.publish(`${this.namespace}::${MySharpeEventNames.COMPLETED}`, { ticker, data: dataWithSharpe })
        return dataWithSharpe
      })
  }

  subscribe(event: MySharpeEvent, callback: (data: unknown) => void): void {
    this.eventBus.subscribe(`${this.namespace}::${event}`, callback as (data: unknown) => void)
  }
}