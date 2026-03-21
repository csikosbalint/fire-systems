type TickerColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'violet'

type Ticker = {
  market: string
  name: string
  ticker: string
  sharpe?: string
  type?: string
  color?: TickerColor
}

export type { Ticker, TickerColor }
