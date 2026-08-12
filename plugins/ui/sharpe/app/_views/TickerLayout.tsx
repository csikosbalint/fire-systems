import ThemeToggle from "@views/ThemeToggle"
import DisciplineTracker from "@views/DisciplineTracker"
import TickerList from "@views/TickerList"

export default function TickerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="border-b border-border px-4 py-3 sm:px-6 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Custom Sharpe Tactical Asset Management Monitor</h1>
      </div>
      <header className="flex items-center justify-end border-b border-border px-4 py-2 sm:px-6">
        <ThemeToggle />
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:gap-8 lg:overflow-hidden">
        {/* Left/Top Column - Watchlist + Rolling Sharpe chart */}
        <div className="flex min-h-0 w-full flex-col lg:h-full lg:w-1/2">
          <TickerList />
        </div>

        {/* Right/Bottom Column - DisciplineTracker */}
        <div className="w-full lg:w-1/2 lg:overflow-y-auto">
          <DisciplineTracker />
        </div>
      </div>
    </div>
  )
}
