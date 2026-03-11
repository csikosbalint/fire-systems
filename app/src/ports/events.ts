import { EventBase } from '../shared/EventBase.js'

export const CounterEventNames = {
  ...EventBase,
  UPDATE: 'update',
} as const

export const MySharpeEventNames = {
  ...EventBase,
  COMPLETED: 'completed',
} as const

export const HistoricalDataEventNames = {
  ...EventBase,
  COMPLETED: 'completed',
  FOUND: 'found',
  NOT_FOUND: 'notfound',
} as const

export const SearchEventNames = {
  ...EventBase,
  FOUND: 'found',
  NOT_FOUND: 'notfound',
} as const