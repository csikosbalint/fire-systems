import TickerDetails from './TickerDetails'
import TickerList from './TickerList'
import ThemeToggle from './ThemeToggle'

export default function TickerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-end border-b border-border px-4 py-2 sm:px-6">
        <ThemeToggle />
      </header>
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:gap-8">
        {/* Left/Top Column - TickerList */}
        <div className="w-full lg:w-1/2">
          <TickerList />
        </div>

        {/* Right/Bottom Column - TickerDetails */}
        <div className="w-full lg:w-1/2">
          <TickerDetails />
        </div>
      </div>
    </div>
  )
}
