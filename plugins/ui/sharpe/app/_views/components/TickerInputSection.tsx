'use client'

import { Command as CommandPrimitive } from 'cmdk'
import { CommandList, CommandEmpty, CommandGroup, CommandItem } from '@ui/command'
import type { Ticker } from '@shared/types/Ticker'
import { useEffect, useRef, useState } from 'react'

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
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(results.length > 0)
  }, [results])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (ticker: Ticker) => {
    add(ticker)
    setKeyword('')
    setOpen(false)
    search('')
  }

  return (
    <div ref={containerRef} className="relative">
      <CommandPrimitive
        shouldFilter={false}
        onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
      >
        <CommandPrimitive.Input
          value={keyword}
          onValueChange={(value) => {
            const upper = value.toUpperCase()
            setKeyword(upper)
            search(upper)
          }}
          placeholder="Search by name or symbol..."
          maxLength={50}
          autoComplete="off"
          className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
        />

        {open && (
          <div className="absolute top-full mt-1 w-full z-50 rounded-md border border-border bg-popover shadow-md">
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {results.map((ticker, i) => (
                  <CommandItem
                    key={`${ticker.ticker}-${i}`}
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
          </div>
        )}
      </CommandPrimitive>
    </div>
  )
}
