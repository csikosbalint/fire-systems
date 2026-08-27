import type { Ticker } from './Ticker'

export type TrackerPivot = {
  id: string
  date: string
  alertDate?: string
  ticker: Ticker
}

export type PricePoint = {
  date: string
  price: number
}

export type HoldingPeriod = {
  pivot: TrackerPivot
  startDate: string
  endDate: string
  startValue: number
  endValue: number
  profit: number
  profitPercent: number
}

export type PivotDelayComparison = {
  alertDate: string
  profitDelta: number
  profitPercentDelta: number
}

export type PortfolioSummary = {
  currentValue: number
  profit: number
  profitPercent: number
}

export type ChartSeries = {
  name: string
  dates: string[]
  values: Array<number | null>
}

export type TrackerCalculation = {
  holdings: HoldingPeriod[]
  summary: PortfolioSummary | null
  delayComparisons: Record<string, PivotDelayComparison>
}
