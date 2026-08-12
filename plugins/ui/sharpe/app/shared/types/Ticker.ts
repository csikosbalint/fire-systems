type TickerColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet'

type SharpeTimeSeries = {
  dates: string[]
  values: number[]
}

type Ticker = {
  market: string
  name: string
  ticker: string
  /** Latest 1-day sharpe value, formatted as "X.XX" */
  sharpe?: string
  /** Rolling sharpe history for charting (~250 fiscal days) */
  sharpeTimeSeries?: SharpeTimeSeries
  type?: string
  color?: TickerColor
}

export type { Ticker, TickerColor, SharpeTimeSeries }
