import type { CounterEventNames, EnrichmentEventNames, EnrichmentNames, HistoricalDataEventNames, MySharpeEventNames, SearchEventNames } from './events.js'

export type CounterEvent = typeof CounterEventNames[keyof typeof CounterEventNames];
export type MySharpeEvent = typeof MySharpeEventNames[keyof typeof MySharpeEventNames];
export type HistoricalDataEvent = typeof HistoricalDataEventNames[keyof typeof HistoricalDataEventNames];
export type SearchEvent = typeof SearchEventNames[keyof typeof SearchEventNames];
export type Enrichments = typeof EnrichmentNames[keyof typeof EnrichmentNames]
export type EnrichmentEvents = typeof EnrichmentEventNames[keyof typeof EnrichmentEventNames]

export type HistoricalData = {
  date: string;
  close: number;
  profit?: number | undefined;
  deviationOfProfit?: number | undefined;
  sharpeRatio?: number | undefined;
};