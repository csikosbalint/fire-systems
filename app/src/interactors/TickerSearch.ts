import { SearchEventNames } from '@ports/events.js'
import type { SearchEvent } from '@ports/types.js'
import type { IEventBus } from '@shared/IEventBus.js'
import type { Logger } from '@shared/Logger.js'
import YahooFinance from 'yahoo-finance2'
import type { SearchResult } from 'yahoo-finance2/modules/search'

export class TickerSearch {
  private namespace = 'TickerSearch'
  private eventBus: IEventBus
  private count: number = 0
  private logger: Logger
  private yahooFinance: InstanceType<typeof YahooFinance>
  
  constructor({ eventBus, logger }: { eventBus: IEventBus, logger: Logger }) {
    this.eventBus = eventBus
    this.logger = logger
    this.yahooFinance = new YahooFinance()
    this.logger.info('TickerSearch initialized')
  }
    
  search(keyword: string): void {
    // Implement the search logic here, e.g., call an API to search for the ticker
    // For demonstration, we'll just log the keyword and publish a dummy result
    this.logger.info(`Searching for keyword: ${keyword}`)
      this.yahooFinance
          .search(keyword).then((result: SearchResult) => {
        // Publish the search result event
        this.eventBus.publish(`${this.namespace}::${SearchEventNames.FOUND}`, {result})
    })
  }
  
  subscribe(event: SearchEvent, callback: (data: unknown) => void): void {
    this.eventBus.subscribe(`${this.namespace}::${event}`, callback)
  }
}