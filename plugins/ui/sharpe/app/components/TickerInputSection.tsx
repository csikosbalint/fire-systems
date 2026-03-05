'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TickerInputSectionProps {
  onAddTicker: (ticker: { isin: string; name: string }) => void
}

export default function TickerInputSection({
  onAddTicker,
}: TickerInputSectionProps) {
  const [isin, setIsin] = useState('')
  const [foundTickerName, setFoundTickerName] = useState('')

  // Placeholder ticker lookup logic - will be replaced with real API call later
  const placeholderLookup: Record<string, string> = {
    US0378331005: 'Apple Inc.',
    US5949181045: 'Microsoft Corporation',
    US02079K3059: 'Alphabet Inc. Class A',
    US88160R1014: 'Tesla Inc.',
    US0231351067: 'Amazon.com Inc.',
  }

  const handleIsinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setIsin(value)

    // Simulate ticker lookup
    if (value.length >= 12) {
      const name = placeholderLookup[value]
      setFoundTickerName(name || 'Ticker not found')
    } else {
      setFoundTickerName('')
    }
  }

  const handleAddClick = () => {
    if (isin && foundTickerName && foundTickerName !== 'Ticker not found') {
      onAddTicker({ isin, name: foundTickerName })
      // Reset form
      setIsin('')
      setFoundTickerName('')
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
        value={isin}
        onChange={handleIsinChange}
        onKeyDown={handleKeyDown}
        className="col-span-2"
        maxLength={12}
      />

      {/* Found Ticker Name Label - 3/6 width */}
      <div className="col-span-3">
        {foundTickerName ? (
          <p
            className={`text-sm ${
              foundTickerName === 'Ticker not found'
                ? 'text-destructive'
                : 'text-foreground font-medium'
            }`}
          >
            {foundTickerName}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {isin ? 'Enter valid ISIN (12 characters)' : 'No ticker selected'}
          </p>
        )}
      </div>

      {/* Add Button - 1/6 width */}
      <Button
        onClick={handleAddClick}
        disabled={!isin || !foundTickerName || foundTickerName === 'Ticker not found'}
        className="col-span-1"
        size="icon"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
