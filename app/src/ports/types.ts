import type { CounterEventNames, HistoricalDataEventNames, MySharpeEventNames } from './events.js'

export type CounterEvent = typeof CounterEventNames[keyof typeof CounterEventNames];
export type MySharpeEvent = typeof MySharpeEventNames[keyof typeof MySharpeEventNames];
export type HistoricalDataEvent = typeof HistoricalDataEventNames[keyof typeof HistoricalDataEventNames];

export type HistoricalData = {
  date: string;
  close: number;
  profit?: number | undefined;
  deviationOfProfit?: number | undefined;
  sharpeRatio?: number | undefined;
};