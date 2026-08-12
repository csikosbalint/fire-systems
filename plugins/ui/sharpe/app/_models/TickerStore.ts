import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SharpeTimeSeries, Ticker, TickerColor } from '@shared/types/Ticker'

type TickerStore = {
  tickers: Ticker[]
  addTicker: (ticker: Ticker) => void
  removeTicker: (tickerSymbol: string) => void
  updateSharpe: (tickerSymbol: string, sharpe: string) => void
  updateSharpeTimeSeries: (
    tickerSymbol: string,
    sharpeTimeSeries: SharpeTimeSeries
  ) => void
  updateColor: (tickerSymbol: string, color: TickerColor) => void
}

const useTickerStore = create<TickerStore>()(
  persist(
    (set) => ({
      tickers: [],
      addTicker: (ticker) =>
        set((state) => ({
          tickers: state.tickers.some((t) => t.ticker === ticker.ticker)
            ? state.tickers
            : [...state.tickers, ticker],
        })),
      removeTicker: (tickerSymbol) =>
        set((state) => ({
          tickers: state.tickers.filter((t) => t.ticker !== tickerSymbol),
        })),
      updateSharpe: (tickerSymbol, sharpe) =>
        set((state) => ({
          tickers: state.tickers.map((t) =>
            t.ticker === tickerSymbol ? { ...t, sharpe } : t
          ),
        })),
      updateSharpeTimeSeries: (tickerSymbol, sharpeTimeSeries) =>
        set((state) => ({
          tickers: state.tickers.map((t) =>
            t.ticker === tickerSymbol ? { ...t, sharpeTimeSeries } : t
          ),
        })),
      updateColor: (tickerSymbol, color) =>
        set((state) => ({
          tickers: state.tickers.map((t) =>
            t.ticker === tickerSymbol ? { ...t, color } : t
          ),
        })),
    }),
    {
      name: 'ticker-list',
      // Strip computed sharpe fields before writing to localStorage — recomputed on load
      partialize: (state) => ({
        tickers: state.tickers.map((ticker) => {
          // Strip computed fields before localStorage; recomputed on load.
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { sharpe, sharpeTimeSeries, ...rest } = ticker
          return rest
        }),
      }),
    }
  )
)

export default useTickerStore
