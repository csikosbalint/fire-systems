import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Ticker } from '@shared/types/Ticker'

type TickerStore = {
  tickers: Ticker[]
  addTicker: (ticker: Ticker) => void
  removeTicker: (tickerSymbol: string) => void
  updateSharpe: (tickerSymbol: string, sharpe: string) => void
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
    }),
    {
      name: 'ticker-list',
      // Strip sharpe before writing to localStorage — it is re-computed on load
      partialize: (state) => ({
        tickers: state.tickers.map(({ sharpe: _sharpe, ...rest }) => rest),
      }),
    }
  )
)

export default useTickerStore
