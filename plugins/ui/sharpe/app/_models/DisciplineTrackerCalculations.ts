import type {
  ChartSeries,
  HoldingPeriod,
  PortfolioSummary,
  PricePoint,
  TrackerCalculation,
  TrackerPivot,
} from '@shared/types/DisciplineTracker'

function isValidPrice(point: PricePoint): boolean {
  return Number.isFinite(point.price) && point.price > 0
}

function sortPrices(prices: PricePoint[]): PricePoint[] {
  return prices.filter(isValidPrice).sort((left, right) => left.date.localeCompare(right.date))
}

function priceOnOrAfter(prices: PricePoint[], date: string): PricePoint | undefined {
  return sortPrices(prices).find((point) => point.date >= date)
}

function latestPrice(prices: PricePoint[]): PricePoint | undefined {
  const sorted = sortPrices(prices)
  return sorted[sorted.length - 1]
}

function pricesForTicker(
  pricesByTicker: Record<string, PricePoint[]>,
  ticker: string
): PricePoint[] {
  return pricesByTicker[ticker] ?? []
}

function calculateSchedule(
  initialCapital: number,
  pivots: TrackerPivot[],
  pricesByTicker: Record<string, PricePoint[]>,
  dateForPivot: (pivot: TrackerPivot) => string
): { holdings: HoldingPeriod[]; summary: PortfolioSummary | null } {
  const orderedPivots = [...pivots].sort((left, right) => left.date.localeCompare(right.date))
  let portfolioValue = initialCapital
  const holdings: HoldingPeriod[] = []

  for (let index = 0; index < orderedPivots.length; index += 1) {
    const pivot = orderedPivots[index]
    const nextPivot = orderedPivots[index + 1]
    const tickerPrices = pricesForTicker(pricesByTicker, pivot.ticker.ticker)
    const purchase = priceOnOrAfter(tickerPrices, dateForPivot(pivot))
    const exit = nextPivot
      ? priceOnOrAfter(tickerPrices, dateForPivot(nextPivot))
      : latestPrice(tickerPrices)

    if (!purchase || !exit) continue

    const startValue = portfolioValue
    const endValue = startValue * (exit.price / purchase.price)
    const profit = endValue - startValue

    holdings.push({
      pivot,
      startDate: purchase.date,
      endDate: exit.date,
      startValue,
      endValue,
      profit,
      profitPercent: (profit / startValue) * 100,
    })
    portfolioValue = endValue
  }

  return {
    holdings,
    summary: holdings.length
      ? {
          currentValue: portfolioValue,
          profit: portfolioValue - initialCapital,
          profitPercent: ((portfolioValue - initialCapital) / initialCapital) * 100,
        }
      : null,
  }
}

export function calculateTracker(
  initialCapital: number,
  pivots: TrackerPivot[],
  pricesByTicker: Record<string, PricePoint[]>
): TrackerCalculation {
  if (!Number.isFinite(initialCapital) || initialCapital <= 0 || pivots.length === 0) {
    return { holdings: [], summary: null, delayComparisons: {} }
  }

  const actual = calculateSchedule(initialCapital, pivots, pricesByTicker, (pivot) => pivot.date)
  const delayComparisons = Object.fromEntries(
    actual.holdings.flatMap((holding) => {
      const alertDate = holding.pivot.alertDate
      if (!alertDate) return []

      const alertPurchase = priceOnOrAfter(
        pricesForTicker(pricesByTicker, holding.pivot.ticker.ticker),
        alertDate
      )
      const actualPurchase = priceOnOrAfter(
        pricesForTicker(pricesByTicker, holding.pivot.ticker.ticker),
        holding.pivot.date
      )
      const actualExit = priceOnOrAfter(
        pricesForTicker(pricesByTicker, holding.pivot.ticker.ticker),
        holding.endDate
      )
      if (!alertPurchase || !actualPurchase || !actualExit) return []

      const alertEndValue =
        holding.startValue * (actualExit.price / alertPurchase.price)
      const alertProfit = alertEndValue - holding.startValue
      const alertProfitPercent = (alertProfit / holding.startValue) * 100

      return [[
        holding.pivot.id,
        {
          alertDate: alertPurchase.date,
          alertProfit,
          alertProfitPercent,
          profitDelta: alertProfit - holding.profit,
          profitPercentDelta: alertProfitPercent - holding.profitPercent,
        },
      ]]
    })
  )

  return {
    holdings: actual.holdings,
    summary: actual.summary,
    delayComparisons,
  }
}

function normalizeSeries(
  prices: PricePoint[],
  dates: string[],
  initialCapital: number
): Array<number | null> {
  const sorted = sortPrices(prices)
  const first = sorted.find((point) => point.date >= dates[0])
  if (!first) return dates.map(() => null)

  const pricesByDate = new Map(sorted.map((point) => [point.date, point.price]))

  return dates.map((date) => {
    const price = pricesByDate.get(date)
    return price === undefined ? null : initialCapital * (price / first.price)
  })
}

export function createChartSeries(
  initialCapital: number,
  pivots: TrackerPivot[],
  pricesByTicker: Record<string, PricePoint[]>,
  chartDates: string[]
): ChartSeries[] {
  const tickerSymbols = Array.from(new Set(pivots.map((pivot) => pivot.ticker.ticker)))
  const benchmarks = tickerSymbols.map((ticker) => ({
    name: ticker,
    dates: chartDates,
    values: normalizeSeries(
      pricesForTicker(pricesByTicker, ticker),
      chartDates,
      initialCapital
    ),
  }))

  if (pivots.length === 0 || chartDates.length === 0) return benchmarks

  const orderedPivots = [...pivots].sort((left, right) => left.date.localeCompare(right.date))
  const portfolioValues: Array<number | null> = []
  let portfolioValue = initialCapital
  let activeTicker: string | undefined
  let previousPrice: number | undefined
  const priceMaps = Object.fromEntries(
    Object.entries(pricesByTicker).map(([ticker, prices]) => [
      ticker,
      new Map(sortPrices(prices).map((point) => [point.date, point.price])),
    ])
  )

  for (const date of chartDates) {
    const activePivot = [...orderedPivots].reverse().find((pivot) => pivot.date <= date)
    if (!activePivot) {
      portfolioValues.push(null)
      continue
    }

    const ticker = activePivot.ticker.ticker
    const price = priceMaps[ticker]?.get(date)
    if (price === undefined) {
      portfolioValues.push(null)
      continue
    }

    if (activeTicker !== ticker || previousPrice === undefined) {
      activeTicker = ticker
      previousPrice = price
      portfolioValues.push(portfolioValue)
      continue
    }

    portfolioValue *= price / previousPrice
    previousPrice = price
    portfolioValues.push(portfolioValue)
  }

  return [...benchmarks, { name: 'Portfolio', dates: chartDates, values: portfolioValues }]
}
