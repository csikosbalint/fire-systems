'use client'

import { useEffect, useMemo, useRef } from 'react'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption, EChartsType } from 'echarts/core'
import type { Ticker, TickerColor } from '@shared/types/Ticker'

echarts.use([
  LineChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
])

const COLOR_MAP: Record<TickerColor, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  violet: '#8b5cf6',
}

const FALLBACK_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

function resolveCssColor(value: string, el: HTMLElement): string {
  if (!value.startsWith('var(')) return value
  const varName = value.slice(4, -1).trim()
  const resolved = getComputedStyle(el).getPropertyValue(varName).trim()
  return resolved || value
}

function seriesColor(ticker: Ticker, index: number, el: HTMLElement): string {
  if (ticker.color) return COLOR_MAP[ticker.color]
  return resolveCssColor(FALLBACK_COLORS[index % FALLBACK_COLORS.length], el)
}

function readTheme(el: HTMLElement) {
  const styles = getComputedStyle(el)
  const muted = styles.getPropertyValue('--muted-foreground').trim() || '#888'
  const border = styles.getPropertyValue('--border').trim() || '#e5e5e5'
  const foreground = styles.getPropertyValue('--foreground').trim() || '#111'
  const card = styles.getPropertyValue('--card').trim() || '#fff'
  return { muted, border, foreground, card }
}

type Props = {
  tickers: Ticker[]
}

export default function SharpeChartVisual({ tickers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<EChartsType | null>(null)

  const chartable = useMemo(
    () =>
      tickers.filter(
        (t) => t.sharpeTimeSeries && t.sharpeTimeSeries.dates.length > 0
      ),
    [tickers]
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const chart = echarts.init(el, undefined, { renderer: 'canvas' })
    chartRef.current = chart

    const ro = new ResizeObserver(() => {
      chart.resize()
    })
    ro.observe(el)

    const onTheme = () => {
      // Force option rebuild on theme class changes
      chart.resize()
      el.dispatchEvent(new Event('themechange'))
    }
    const mo = new MutationObserver(onTheme)
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      mo.disconnect()
      ro.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    const chart = chartRef.current
    if (!el || !chart) return

    const apply = () => {
      const theme = readTheme(el)

      if (chartable.length === 0) {
        chart.clear()
        chart.setOption({
          title: {
            text: 'Add tickers to see rolling Sharpe',
            left: 'center',
            top: 'middle',
            textStyle: {
              color: theme.muted,
              fontSize: 13,
              fontWeight: 400,
            },
          },
        } satisfies EChartsCoreOption)
        return
      }

      const allDates = Array.from(
        new Set(chartable.flatMap((t) => t.sharpeTimeSeries!.dates))
      ).sort()

      const option: EChartsCoreOption = {
        animationDuration: 300,
        color: chartable.map((t, i) => seriesColor(t, i, el)),
        legend: {
          type: 'scroll',
          top: 4,
          left: 'center',
          textStyle: { color: theme.foreground, fontSize: 11 },
          pageTextStyle: { color: theme.muted },
          inactiveColor: theme.muted,
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: theme.card,
          borderColor: theme.border,
          textStyle: { color: theme.foreground, fontSize: 12 },
          valueFormatter: (value: unknown) =>
            typeof value === 'number' ? value.toFixed(2) : String(value ?? ''),
        },
        grid: {
          left: 44,
          right: 16,
          top: 40,
          bottom: 28,
          containLabel: false,
        },
        xAxis: {
          type: 'category',
          data: allDates,
          boundaryGap: false,
          axisLine: { lineStyle: { color: theme.border } },
          axisLabel: {
            color: theme.muted,
            fontSize: 10,
            hideOverlap: true,
          },
          axisTick: { show: false },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          scale: true,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: theme.muted,
            fontSize: 10,
            formatter: (v: number) => v.toFixed(1),
          },
          splitLine: {
            lineStyle: { color: theme.border, type: 'dashed' },
          },
        },
        series: chartable.map((t, i) => {
          const dateToValue = new Map(
            t.sharpeTimeSeries!.dates.map((d, idx) => [
              d,
              t.sharpeTimeSeries!.values[idx],
            ])
          )
          return {
            name: t.ticker,
            type: 'line' as const,
            showSymbol: false,
            smooth: 0.15,
            lineStyle: { width: 2 },
            emphasis: { focus: 'series' as const },
            data: allDates.map((d) => dateToValue.get(d) ?? null),
            itemStyle: { color: seriesColor(t, i, el) },
          }
        }),
      }

      chart.setOption(option, { notMerge: true })
    }

    apply()
    const onTheme = () => apply()
    el.addEventListener('themechange', onTheme)
    return () => el.removeEventListener('themechange', onTheme)
  }, [chartable])

  return <div ref={containerRef} className="h-full w-full" />
}
