'use client'
import useTickerListModels from '@models/TickerList'
import TickerTable from './components/TickerTable'
import TickerInputSection from './components/TickerInputSection'

export default function TickerList() {
  const { tickers, results, addTicker, doSearch } = useTickerListModels()
  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Add Tickers</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter keyword to add tickers to your portfolio
        </p>
      </div>

      {/* Input Section */}
      <TickerInputSection add={(ticker) => addTicker({ ticker })} search={doSearch} results={results} />

      {/* Table Section */}
      <TickerTable tickers={tickers} />
    </div>
  )
}
