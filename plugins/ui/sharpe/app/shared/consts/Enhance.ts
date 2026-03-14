export const IndicatorNames = {
  SHARPE: 'sharpe',
} as const

export type Indicators = (typeof IndicatorNames)[keyof typeof IndicatorNames]
