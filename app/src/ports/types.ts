import type { CounterEventNames, HistoricalDataEventNames, MySharpeEventNames, SearchEventNames } from './events.js'

export type CounterEvent = typeof CounterEventNames[keyof typeof CounterEventNames];
export type MySharpeEvent = typeof MySharpeEventNames[keyof typeof MySharpeEventNames];
export type HistoricalDataEvent = typeof HistoricalDataEventNames[keyof typeof HistoricalDataEventNames];
export type SearchEvent = typeof SearchEventNames[keyof typeof SearchEventNames];

export type HistoricalData = {
  date: string;
  close: number;
  profit?: number | undefined;
  deviationOfProfit?: number | undefined;
  sharpeRatio?: number | undefined;
};