'use client'

import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption, EChartsType } from 'echarts/core'
import type { ChartSeries, TrackerPivot } from '@shared/types/DisciplineTracker'

echarts.use([
  LineChart,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
])

const COLORS = ['#0f766e', '#d97706', '#2563eb', '#dc2626', '#7c3aed', '#0891b2']

function theme(element: HTMLElement) {
  const styles = getComputedStyle(element)
  return {
    border: styles.getPropertyValue('--border').trim() || '#e5e5e5',
    card: styles.getPropertyValue('--card').trim() || '#ffffff',
    foreground: styles.getPropertyValue('--foreground').trim() || '#111111',
    muted: styles.getPropertyValue('--muted-foreground').trim() || '#737373',
  }
}

export default function DisciplineTrackerChart({
  dates,
  series,
  pivots,
  isLoading,
  error,
}: {
  dates: string[]
  series: ChartSeries[]
  pivots: TrackerPivot[]
  isLoading: boolean
  error: string | null
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<EChartsType | null>(null)
  const [themeRevision, setThemeRevision] = useState(0)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const chart = echarts.init(element, undefined, { renderer: 'canvas' })
    chartRef.current = chart
    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(element)
    const themeObserver = new MutationObserver(() => {
      setThemeRevision((revision) => revision + 1)
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => {
      themeObserver.disconnect()
      resizeObserver.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const element = containerRef.current
    const chart = chartRef.current
    if (!element || !chart) return
    const colors = theme(element)
    const actualPivotDates = pivots
      .map((pivot) => pivot.date)
      .filter((date) => dates.includes(date))
    const alertPivotDates = pivots
      .flatMap((pivot) => (pivot.alertDate ? [pivot.alertDate] : []))
      .filter((date) => dates.includes(date))

    if (isLoading || error || dates.length === 0 || series.length === 0) {
      chart.clear()
      chart.setOption({
        title: {
          text: error ?? (isLoading ? 'Loading historical prices' : 'Add pivots to view portfolio performance'),
          left: 'center',
          top: 'middle',
          textStyle: { color: colors.muted, fontSize: 13, fontWeight: 400 },
        },
      } satisfies EChartsCoreOption)
      return
    }

    const option: EChartsCoreOption = {
      animationDuration: 300,
      legend: {
        type: 'scroll',
        top: 4,
        left: 'center',
        textStyle: { color: colors.foreground, fontSize: 11 },
        inactiveColor: colors.muted,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: colors.card,
        borderColor: colors.border,
        textStyle: { color: colors.foreground, fontSize: 12 },
        valueFormatter: (value: unknown) =>
          typeof value === 'number'
            ? new Intl.NumberFormat('en-IE', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              }).format(value)
            : '—',
      },
      grid: { left: 56, right: 16, top: 42, bottom: 28 },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: colors.border } },
        axisLabel: { color: colors.muted, fontSize: 10, hideOverlap: true },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: colors.muted,
          fontSize: 10,
          formatter: (value: number) => `€${Math.round(value / 1000)}k`,
        },
        splitLine: { lineStyle: { color: colors.border, type: 'dashed' } },
      },
      series: series.map((entry, index) => {
        const portfolio = entry.name === 'Portfolio'
        return {
          name: entry.name,
          type: 'line' as const,
          data: entry.values,
          showSymbol: false,
          smooth: 0.1,
          connectNulls: false,
          lineStyle: {
            width: portfolio ? 3 : 1.5,
            opacity: portfolio ? 1 : 0.45,
          },
          itemStyle: { color: portfolio ? colors.foreground : COLORS[index % COLORS.length] },
          z: portfolio ? 5 : 1,
          emphasis: { focus: 'series' as const },
          ...(portfolio && (actualPivotDates.length > 0 || alertPivotDates.length > 0)
            ? {
                markLine: {
                  symbol: 'none',
                  silent: true,
                  label: { show: false },
                  data: [
                    ...actualPivotDates.map((date) => ({
                      xAxis: date,
                      lineStyle: {
                        color: colors.muted,
                        type: 'solid' as const,
                        width: 1,
                        opacity: 0.65,
                      },
                    })),
                    ...alertPivotDates.map((date) => ({
                      xAxis: date,
                      lineStyle: {
                        color: colors.muted,
                        type: 'dotted' as const,
                        width: 1,
                        opacity: 0.9,
                      },
                    })),
                  ],
                },
              }
            : {}),
        }
      }),
    }
    chart.setOption(option, { notMerge: true })
  }, [dates, error, isLoading, pivots, series, themeRevision])

  return <div ref={containerRef} className="h-full w-full" />
}
