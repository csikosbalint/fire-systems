'use client'

import { Command as CommandPrimitive } from 'cmdk'
import { useEffect, useRef, useState } from 'react'
import { CommandEmpty, CommandGroup, CommandItem, CommandList } from '@ui/command'
import type { Ticker } from '@shared/types/Ticker'

export default function TrackerTickerInput({
  results,
  onSearch,
  onSelect,
}: {
  results: Ticker[]
  onSearch: (keyword: string) => void
  onSelect: (ticker: Ticker) => void
}) {
  const [keyword, setKeyword] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpen(results.length > 0)
  }, [results])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      <CommandPrimitive shouldFilter={false} onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false)
      }}>
        <CommandPrimitive.Input
          value={keyword}
          onValueChange={(value) => {
            const nextKeyword = value.toUpperCase()
            setKeyword(nextKeyword)
            onSearch(nextKeyword)
          }}
          placeholder="Search ticker"
          aria-label="Pivot ticker"
          autoComplete="off"
          maxLength={50}
          className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
        />
        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {results.map((ticker, index) => (
                  <CommandItem
                    key={`${ticker.ticker || 'result'}-${ticker.market || 'market'}-${index}`}
                    value={ticker.ticker}
                    onSelect={() => {
                      setKeyword(ticker.ticker)
                      setOpen(false)
                      onSelect(ticker)
                    }}
                    className="flex cursor-pointer flex-col items-start gap-0.5"
                  >
                    <span className="text-sm font-semibold">{ticker.ticker}</span>
                    <span className="text-xs text-muted-foreground">
                      {ticker.name}{ticker.market ? ` · ${ticker.market}` : ''}
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
