import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Ticker {
  isin: string
  name: string
  price?: number
}

interface TickerTableProps {
  tickers: Ticker[]
}

export default function TickerTable({ tickers }: TickerTableProps) {
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
            <TableHead>ISIN</TableHead>
            <TableHead>Ticker Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickers.map((ticker) => (
            <TableRow key={ticker.isin}>
              <TableCell className="font-mono text-sm">{ticker.isin}</TableCell>
              <TableCell>{ticker.name}</TableCell>
              <TableCell className="text-right text-muted-foreground">
                {ticker.price ? `$${ticker.price.toFixed(2)}` : '—'}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                —
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
