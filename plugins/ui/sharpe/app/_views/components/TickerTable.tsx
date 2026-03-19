import { Trash2 } from 'lucide-react'
import { Ticker } from '@shared/types/Ticker'
import { Button } from '@ui/button'
import { Skeleton } from '@ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/table'

export default function TickerTable({
  tickers,
  onRemove,
}: {
  tickers: Ticker[]
  onRemove: (tickerSymbol: string) => void
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
              <TableCell className="font-mono text-sm">{ticker.ticker}</TableCell>
              <TableCell>{ticker.name} {ticker.type ? `(${ticker.type})` : ''}</TableCell>
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
