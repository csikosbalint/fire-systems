'use client'

import { useState } from 'react'
import TickerInputSection from './TickerInputSection'
import TickerTable from './TickerTable'

interface Ticker {
  isin: string
  name: string
  price?: number
}

export default function TickerList() {
  const [tickers, setTickers] = useState<Ticker[]>([])

  const handleAddTicker = (newTicker: { isin: string; name: string }) => {
    // Check for duplicates
    const exists = tickers.some((t) => t.isin === newTicker.isin)
    if (!exists) {
      setTickers([...tickers, { ...newTicker }])
    }
  }

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Add Tickers</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter ISIN to add tickers to your portfolio
        </p>
      </div>

      {/* Input Section */}
      <TickerInputSection onAddTicker={handleAddTicker} />

      {/* Table Section */}
      <TickerTable tickers={tickers} />
    </div>
  )
}
