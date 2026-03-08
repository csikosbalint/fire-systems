'use client'

import { Plus } from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import type { Ticker } from '@shared/Ticker'
import { useState } from 'react'

export default function TickerInputSection({
  add,
  search,
}: {
  add: (ticker: Ticker) => void
  search: (isin: string) => Ticker | null
}) {
  const [isinTyped, setIsin] = useState('')
  const [tickerFound, setTickerFound] = useState<Ticker | null>(null)

  const handleIsinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setIsin(value)
    const found = search(value)
    if ( found ) setTickerFound(found)
    else setTickerFound(null)
  }

  const handleAddClick = () => {
    if (tickerFound) {
      add(tickerFound)
      setIsin('')
      setTickerFound(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddClick()
    }
  }

  return (
    <div className="grid grid-cols-6 gap-3 items-center">
      {/* ISIN Input - 2/6 width */}
      <Input
        type="text"
        placeholder="Enter ISIN..."
        value={ isinTyped }
        onChange={handleIsinChange}
        onKeyDown={handleKeyDown}
        className="col-span-2"
        maxLength={12}
      />

      {/* Found Ticker Name Label - 3/6 width */}
      <div className="col-span-3">
        {tickerFound ? (
          <p
            className={`text-sm ${
              tickerFound === null
                ? 'text-destructive'
                : 'text-foreground font-medium'
            }`}
          >
            {tickerFound ? tickerFound.name : 'Ticker not found'}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isinTyped ? 'Enter valid ISIN (12 characters)' : 'No ticker selected'}
          </p>
        )}
      </div>

      {/* Add Button - 1/6 width */}
      <Button
        onClick={handleAddClick}
        disabled={!isinTyped || !tickerFound}
        className="col-span-1"
        size="icon"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
