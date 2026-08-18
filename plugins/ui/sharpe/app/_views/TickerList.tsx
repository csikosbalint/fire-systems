'use client'
import useTickerListAdapter from '@models/TickerList'
import TickerTable from './components/TickerTable'
import TickerInputSection from './components/TickerInputSection'
import SharpeChart from './SharpeChart'

export default function TickerList() {
  const adapter = useTickerListAdapter()
  const { addTicker, removeTicker, doSearch, updateColor } = adapter.useController()
  const { tickers, results, chart } = adapter.usePresenter()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
        <div className="pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Watchlist</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter keyword to add tickers to your portfolio
          </p>
        </div>

        <TickerInputSection
          add={(ticker) => addTicker({ ticker })}
          search={doSearch}
          results={results}
        />

        <SharpeChart
          tickers={chart.tickers}
          isLoading={chart.isLoading}
          isPartialLoading={chart.isPartialLoading}
        />

        <TickerTable
          tickers={tickers}
          onRemove={removeTicker}
          onColorChange={updateColor}
        />
      </div>
    </div>
  )
}
