import type { CounterEventNames, MySharpeEventNames } from './events.js'

export type CounterEvent = typeof CounterEventNames[keyof typeof CounterEventNames];
export type MySharpeEvent = typeof MySharpeEventNames[keyof typeof MySharpeEventNames];

export type HistoricalData = {
  date: string;
  close: number;
  profit?: number | undefined;
  deviationOfProfit?: number | undefined;
  sharpeRatio?: number | undefined;
};