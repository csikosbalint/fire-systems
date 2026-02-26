export interface IEventBus {
  publish(event: string, data: unknown): void;
  subscribe(event: string, callback: (data: unknown) => void): void;
}