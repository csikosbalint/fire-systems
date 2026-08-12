'use client'

import type { Ticker } from '@shared/types/Ticker'
import SharpeChartSkeleton from './components/SharpeChartSkeleton'
import SharpeChartVisual from './components/SharpeChartVisual'

type Props = {
  tickers: Ticker[]
  isLoading: boolean
  isPartialLoading?: boolean
}

export default function SharpeChart({
  tickers,
  isLoading,
  isPartialLoading = false,
}: Props) {
  const hasSeries = tickers.some(
    (t) => t.sharpeTimeSeries && t.sharpeTimeSeries.dates.length > 0
  )
  const showSkeleton = isLoading || (!hasSeries && tickers.some((t) => !t.sharpe))

  return (
    <section className="flex h-[280px] w-full flex-col bg-card sm:h-[320px]">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">
            Rolling Sharpe
          </h3>
          <p className="text-xs text-muted-foreground">
            ~250 fiscal days · click legend to toggle
          </p>
        </div>
        {isPartialLoading && (
          <span className="text-xs text-muted-foreground animate-pulse">
            Updating…
          </span>
        )}
      </div>
      <div className="min-h-0 flex-1 px-1 pb-1 pt-0">
        {showSkeleton ? <SharpeChartSkeleton /> : <SharpeChartVisual tickers={tickers} />}
      </div>
    </section>
  )
}
