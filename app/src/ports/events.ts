import { EventBase } from '../shared/EventBase.js'

export const CounterEventNames = {
  ...EventBase,
  UPDATE: 'update',
} as const

export const MySharpeEventNames = {
  ...EventBase,
  COMPLETED: 'completed',
} as const