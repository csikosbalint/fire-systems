import type { IEventBus } from '@shared/IEventBus.js'
import type { Logger } from '@shared/Logger.js'

export default class FactoryBase {
    protected eventBus: IEventBus
    protected logger: Logger

    constructor({ eventBus, logger }: { eventBus: IEventBus, logger: Logger }) {
        this.eventBus = eventBus
        this.logger = logger
    }
}