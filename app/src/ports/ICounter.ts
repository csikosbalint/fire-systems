export interface ICounter {
  increment(): void;
  getCount(): number;
  subscribe(event: string, callback: (data: unknown) => void): void;
}
export enum CounterEvent {
  UPDATE = 'update',
}