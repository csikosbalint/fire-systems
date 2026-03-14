import { Ticker } from '@shared/types/Ticker'
import { Skeleton } from '@ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/table'

export default function TickerTable({ tickers } : { tickers: Ticker[] }) {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickers.map((ticker,index) => (
            <TableRow key={index}>
              <TableCell className="font-mono text-sm">{ticker.ticker}</TableCell>
              <TableCell>{ticker.name}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {ticker.market}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                { ticker?.sharpe ? ticker.sharpe.toFixed(2) :  <Skeleton className="h-4 w-full" /> }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
