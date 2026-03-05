import React from 'react'

export default function TickerList() {
  // Placeholder data - will be replaced with real data later
  const tickers = [
    { id: 1, symbol: 'AAPL', name: 'Apple Inc.', price: 182.52 },
    { id: 2, symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.23 },
    { id: 3, symbol: 'MSFT', name: 'Microsoft Corporation', price: 427.15 },
    { id: 4, symbol: 'TSLA', name: 'Tesla Inc.', price: 238.45 },
    { id: 5, symbol: 'AMZN', name: 'Amazon.com Inc.', price: 192.87 },
  ]

  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Tickers</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select a ticker to view details
        </p>
      </div>

      <div className="space-y-2">
        {tickers.map((ticker) => (
          <div
            key={ticker.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-3 hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="space-y-1">
              <p className="font-semibold text-sm">{ticker.symbol}</p>
              <p className="text-xs text-muted-foreground">{ticker.name}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${ticker.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
