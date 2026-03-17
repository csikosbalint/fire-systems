'use client'

import { Input } from '@ui/input'
import { Popover, PopoverContent, PopoverAnchor } from '@ui/popover'
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@ui/command'
import type { Ticker } from '@shared/types/Ticker'
import { useEffect, useState } from 'react'

export default function TickerInputSection({
  add,
  search,
  results,
}: {
  add: (ticker: Ticker) => void
  search: (keyword: string) => void
  results: Ticker[]
}) {
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(results.length > 0)
  }, [results])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    setKeyword(value)
    search(value)
  }

  const handleSelect = (ticker: Ticker) => {
    add(ticker)
    setKeyword('')
    setOpen(false)
    search('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && results.length > 0) {
      handleSelect(results[0])
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          type="text"
          placeholder="Search by name or symbol..."
          value={keyword}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          maxLength={50}
          autoComplete="off"
        />
      </PopoverAnchor>
      <PopoverContent
        className="p-0 w-[--radix-popover-trigger-width]"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {results.map((ticker) => (
                <CommandItem
                  key={ticker.ticker}
                  value={ticker.ticker}
                  onSelect={() => handleSelect(ticker)}
                  className="flex flex-col items-start gap-0.5 cursor-pointer"
                >
                  <span className="font-semibold text-sm">{ticker.ticker}</span>
                  <span className="text-xs text-muted-foreground">
                    {ticker.name}
                    {ticker.market ? ` · ${ticker.market}` : ''}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
