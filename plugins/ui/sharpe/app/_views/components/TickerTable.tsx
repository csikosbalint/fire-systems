'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Ticker, TickerColor } from '@shared/types/Ticker'
import { Button } from '@ui/button'
import { Skeleton } from '@ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/table'

const COLOR_CLASSES: Record<TickerColor, string> = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
}

function ColorDot({
  color,
  tickerSymbol,
  onColorChange,
}: {
  color?: TickerColor
  tickerSymbol: string
  onColorChange: (tickerSymbol: string, color: TickerColor) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label="Select color"
          className={`h-4 w-4 rounded-full border border-border transition-colors ${
            color ? COLOR_CLASSES[color] : 'bg-muted'
          }`}
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="flex gap-2">
          {(Object.keys(COLOR_CLASSES) as TickerColor[]).map((c) => (
            <button
              key={c}
              aria-label={c}
              className={`h-5 w-5 rounded-full ${COLOR_CLASSES[c]} ${
                color === c ? 'ring-2 ring-offset-2 ring-foreground' : ''
              }`}
              onClick={() => {
                onColorChange(tickerSymbol, c)
                setOpen(false)
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function TickerTable({
  tickers,
  onRemove,
  onColorChange,
}: {
  tickers: Ticker[]
  onRemove: (tickerSymbol: string) => void
  onColorChange: (tickerSymbol: string, color: TickerColor) => void
}) {
  if (tickers.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No tickers added yet. Use the form above to add tickers.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Market</TableHead>
            <TableHead className="text-right">Sharpe</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickers.map((ticker, index) => (
            <TableRow key={index}>
              <TableCell>
                <ColorDot
                  color={ticker.color}
                  tickerSymbol={ticker.ticker}
                  onColorChange={onColorChange}
                />
              </TableCell>
              <TableCell className="font-mono text-sm">{ticker.ticker}</TableCell>
              <TableCell>{ticker.name}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {ticker.market}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {ticker?.sharpe || <Skeleton className="h-4 w-full" />}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(ticker.ticker)}
                  aria-label={`Remove ${ticker.ticker}`}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
