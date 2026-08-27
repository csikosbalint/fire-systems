'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@ui/table'
import type { TrackerCalculation, TrackerPivot } from '@shared/types/DisciplineTracker'

const currency = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const percentage = new Intl.NumberFormat('en-IE', {
  style: 'percent',
  maximumFractionDigits: 2,
})

function resultClass(value: number): string {
  if (value > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (value < 0) return 'text-red-600 dark:text-red-400'
  return 'text-muted-foreground'
}

function elapsedDays(startDate: string, endDate: string): number {
  return Math.max(
    0,
    Math.round(
      (Date.parse(`${endDate}T00:00:00.000Z`) -
        Date.parse(`${startDate}T00:00:00.000Z`)) /
        86_400_000
    )
  )
}

function formatHoldTime(startDate: string, endDate: string): string {
  const days = elapsedDays(startDate, endDate)
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'}`

  const weeks = Math.floor(days / 7)
  const remainingDays = days % 7
  return remainingDays === 0
    ? `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`
    : `${weeks}w ${remainingDays}d`
}

export default function DisciplineTrackerTable({
  pivots,
  calculation,
  isLoading,
  onRemove,
}: {
  pivots: TrackerPivot[]
  calculation: TrackerCalculation
  isLoading: boolean
  onRemove: (pivotId: string) => void
}) {
  if (pivots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        Add your first dated ticker purchase to begin tracking the portfolio.
      </div>
    )
  }

  const holdingsByPivot = new Map(
    calculation.holdings.map((holding) => [holding.pivot.id, holding])
  )
  const hasAlerts = Object.keys(calculation.delayComparisons).length > 0

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Actual Date</TableHead>
            {hasAlerts && <TableHead className="text-right">Delay</TableHead>}
            <TableHead>Ticker</TableHead>
            <TableHead className="text-right">End</TableHead>
            <TableHead className="text-right">Held</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-right">Profit</TableHead>
            {hasAlerts && <TableHead className="text-right">Δ Profit</TableHead>}
            <TableHead className="text-right">Return</TableHead>
            {hasAlerts && (
              <>
                <TableHead className="text-right">Δ Return</TableHead>
              </>
            )}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pivots.map((pivot) => {
            const holding = holdingsByPivot.get(pivot.id)
            const delayComparison = calculation.delayComparisons[pivot.id]
            // the delay comparison is attached to this (closed) holding's own exit date
            const pivotDelay =
              holding && delayComparison
                ? formatHoldTime(delayComparison.alertDate, holding.endDate)
                : undefined
            const delayDays =
              holding && delayComparison
                ? elapsedDays(delayComparison.alertDate, holding.endDate)
                : undefined
            return (
              <TableRow key={pivot.id}>
                <TableCell>{pivot.date}</TableCell>
                {hasAlerts && (
                  <TableCell
                    className={`text-right ${
                      delayDays !== undefined && delayDays > 4
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {pivotDelay ?? '—'}
                  </TableCell>
                )}
                <TableCell>
                  <div className="font-mono text-sm">{pivot.ticker.ticker}</div>
                  <div className="max-w-32 truncate text-xs text-muted-foreground">
                    {pivot.ticker.name}
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {holding?.endDate ?? (isLoading ? 'Loading' : 'Unavailable')}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {holding
                    ? formatHoldTime(holding.startDate, holding.endDate)
                    : '—'}
                </TableCell>
                <TableCell className="text-right">
                  {holding ? currency.format(holding.endValue) : '—'}
                </TableCell>
                <TableCell className={`text-right ${holding ? resultClass(holding.profit) : ''}`}>
                  {holding ? currency.format(holding.profit) : '—'}
                </TableCell>
                {hasAlerts && (
                  <TableCell className={`text-right ${delayComparison ? resultClass(delayComparison.profitDelta) : ''}`}>
                    {delayComparison ? currency.format(delayComparison.profitDelta) : '—'}
                  </TableCell>
                )}
                <TableCell className={`text-right ${holding ? resultClass(holding.profit) : ''}`}>
                  {holding ? percentage.format(holding.profitPercent / 100) : '—'}
                </TableCell>
                {hasAlerts && (
                  <TableCell className={`text-right ${delayComparison ? resultClass(delayComparison.profitPercentDelta) : ''}`}>
                    {delayComparison
                      ? percentage.format(delayComparison.profitPercentDelta / 100)
                      : '—'}
                  </TableCell>
                )}
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${pivot.ticker.ticker} pivot on ${pivot.date}`}
                    title="Delete pivot"
                    onClick={() => onRemove(pivot.id)}
                  >
                    <Trash2 className="text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        {calculation.summary && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={hasAlerts ? 5 : 4}>Total</TableCell>
              <TableCell className="text-right">
                {currency.format(calculation.summary.currentValue)}
              </TableCell>
              <TableCell className={`text-right ${resultClass(calculation.summary.profit)}`}>
                {currency.format(calculation.summary.profit)}
              </TableCell>
              {hasAlerts && <TableCell />}
              <TableCell className={`text-right ${resultClass(calculation.summary.profit)}`}>
                {percentage.format(calculation.summary.profitPercent / 100)}
              </TableCell>
              {hasAlerts && <TableCell />}
              <TableCell />
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  )
}
