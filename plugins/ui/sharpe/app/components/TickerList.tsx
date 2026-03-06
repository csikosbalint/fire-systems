'use client'
import useTickerListAdapter from '@adapters/TickerList'
import TickerInputSection from './TickerInputSection'
import TickerTable from './TickerTable'

export default function TickerList() {
  const { useController, usePresenter } = useTickerListAdapter()
  const { tickers } = usePresenter()
  const { addTicker, searchByISIN } = useController()
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
      <TickerInputSection add={addTicker} search={searchByISIN}/>

      {/* Table Section */}
      <TickerTable tickers={tickers} />
    </div>
  )
}
