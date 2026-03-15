import { asClass, createContainer, InjectionMode, Lifetime } from 'awilix'
import { EventBus } from './EventBus.js'
import { Logger } from './Logger.js'
import { Validator } from '@entities/Validator.js'
import { Counter } from '@interactors/Counter.js'
import { MySharpe } from '@entities/MySharpe.js'

let myContainer: ReturnType<typeof createContainer>
export default function getContainer() : ReturnType<typeof createContainer> {
    if (myContainer) return myContainer
    // setup container and register dependencies
    const container = createContainer({
        injectionMode: InjectionMode.PROXY,
        strict: true,
    })
    container.register({
        // shared
        eventBus: asClass(EventBus, { lifetime: Lifetime.SINGLETON }),
        logger: asClass(Logger, { lifetime: Lifetime.SINGLETON }),
        // entities
        validator: asClass(Validator, { lifetime: Lifetime.SINGLETON }),
        // interactors
        counter: asClass(Counter, { lifetime: Lifetime.SINGLETON }),
        mySharpe: asClass(MySharpe, { lifetime: Lifetime.SINGLETON }),
    })
    myContainer = container
    return myContainer
}