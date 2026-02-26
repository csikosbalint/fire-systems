import type { IEventBus } from './IEventBus.js'

export class EventBus implements IEventBus {
  private events: { [key: string]: ((payload: unknown) => void)[] } = {}
  
  subscribe(event: string, callback: (data: unknown) => void): void {
    if (!this.events[event]) this.events[event] = []
    this.events[event].push(callback)
  }
  
  publish(event: string, data: unknown): void {
    this.events[event]?.forEach(callback => callback(data))
  }
}