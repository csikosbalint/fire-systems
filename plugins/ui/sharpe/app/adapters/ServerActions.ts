'use server'
import { Ticker } from '@shared/Ticker'
import {
  useTickerSearchPort as execTickerSearchPort,
  SearchEventNames,
} from 'fire-app/ports'
export async function search(keyword: string): Promise<Ticker | null> {
  const { searchTicker, subscribe } = execTickerSearchPort()

  const ret = new Promise<Ticker | null>((resolve) => {
    // Subscribe to search results
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscribe(SearchEventNames.FOUND, (data: any) => {
      if (data.quotes && data.quotes.length === 1) {
        resolve({
          isin: data.quotes[0].isin || '',
          ticker: data.quotes[0].symbol,
          name:
            data.quotes[0].longname ||
            data.quotes[0].shortname ||
            data.quotes[0].symbol,
        })
      } else {
        resolve(null)
      }
    })
    subscribe(SearchEventNames.NOT_FOUND, () => {
      resolve(null)
    })
  })
  searchTicker(keyword)

  return ret
}
