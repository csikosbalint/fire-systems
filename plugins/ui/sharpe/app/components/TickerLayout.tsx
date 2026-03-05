'use client'

import TickerDetails from './TickerDetails'
import TickerList from './TickerList'

export default function TickerLayout() {
  return (
    <div className="flex min-h-screen flex-col gap-6 bg-background p-4 sm:p-6 lg:flex-row lg:gap-8">
      {/* Left/Top Column - TickerList */}
      <div className="w-full lg:w-1/2">
        <TickerList />
      </div>

      {/* Right/Bottom Column - TickerDetails */}
      <div className="w-full lg:w-1/2">
        <TickerDetails />
      </div>
    </div>
  )
}
