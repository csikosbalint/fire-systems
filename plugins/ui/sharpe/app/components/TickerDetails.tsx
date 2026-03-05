import React from 'react'

export default function TickerDetails() {
  // Placeholder data - will be replaced with real data later
  const selectedTicker = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 182.52,
    change: 2.45,
    changePercent: 1.36,
    high: 185.23,
    low: 180.12,
    volume: '52,341,200',
    marketCap: '2.82T',
    peRatio: 31.2,
    dividend: 0.24,
  }

  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          {selectedTicker.symbol}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {selectedTicker.name}
        </p>
      </div>

      <div className="space-y-4">
        {/* Price Section */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Current Price</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold">
              ${selectedTicker.price.toFixed(2)}
            </p>
            <span
              className={`text-sm font-medium ${
                selectedTicker.change >= 0
                  ? 'text-green-600 dark:text-green-500'
                  : 'text-red-600 dark:text-red-500'
              }`}
            >
              {selectedTicker.change >= 0 ? '+' : ''}
              {selectedTicker.change.toFixed(2)} ({selectedTicker.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">High</p>
            <p className="text-lg font-semibold mt-1">
              ${selectedTicker.high.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Low</p>
            <p className="text-lg font-semibold mt-1">
              ${selectedTicker.low.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="text-lg font-semibold mt-1">
              {selectedTicker.volume}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="text-lg font-semibold mt-1">
              {selectedTicker.marketCap}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 rounded-lg border border-border bg-card">
            <span className="text-sm text-muted-foreground">P/E Ratio</span>
            <span className="font-semibold">{selectedTicker.peRatio}</span>
          </div>
          <div className="flex justify-between items-center p-3 rounded-lg border border-border bg-card">
            <span className="text-sm text-muted-foreground">Dividend</span>
            <span className="font-semibold">${selectedTicker.dividend.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
