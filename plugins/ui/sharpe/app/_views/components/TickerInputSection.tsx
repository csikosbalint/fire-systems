'use client'

import { Plus } from 'lucide-react'
import { Button } from '@ui/button'
import { Input } from '@ui/input'
import type { Ticker } from '@shared/types/Ticker'
import { useState } from 'react'

export default function TickerInputSection({
  add,
  search,
  found,
}: {
    add: (ticker: Ticker) => void
    search: (keyword: string) => void
    found: Ticker | null
}) {
  const [keyword, setKeyword] = useState('')

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setKeyword(value)
    search(value)
  }

  const handleAddClick = () => {
    if (found) {
      add(found)
      setKeyword('')
      search('') // Clear search result after adding
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddClick()
    }
  }

  return (
    <div className="grid grid-cols-6 gap-3 items-center">
      <Input
        type="text"
        placeholder="Enter ISIN..."
        value={ keyword }
        onChange={handleSearchChange}
        onKeyDown={handleKeyDown}
        className="col-span-2"
        maxLength={12}
      />

      {/* Found Ticker Name Label - 3/6 width */}
      <div className="col-span-3">
        {found ? (
          <p
            className={`text-sm ${
              found === null
                ? 'text-destructive'
                : 'text-foreground font-medium'
            }`}
          >
            {found ? found.name : 'Ticker not found'}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {keyword ? 'Enter valid ISIN (12 characters)' : 'No ticker selected'}
          </p>
        )}
      </div>

      {/* Add Button - 1/6 width */}
      <Button
        onClick={handleAddClick}
        disabled={!keyword || !found}
        className="col-span-1"
        size="icon"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
