export default class Registry {
    events: { [key: string]: ((payload: unknown) => void)[] }
    constructor() {
        this.events = {}
    }

    subscribe({ event, callback }: { event: string, callback: (payload: unknown) => void }) {
        if (!this.events[event]) {
            this.events[event] = []
        }
        this.events[event].push(callback)
    }

    publish({ event, data }: { event: string, data: unknown }) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data))
        }
    }
}