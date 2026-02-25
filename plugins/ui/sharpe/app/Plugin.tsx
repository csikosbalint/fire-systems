'use client'
import { useState } from "react"
import { Counter } from 'fire-app/adapters'

export default function usePlugin() {
    // local model state (react)
    const [counter, setCounter] = useState(0)
    // platform we depend on
    const counterPlatform = new Counter()
    // subscribe to platform updates
    const callback = (data: unknown) => {
        setCounter(data as number)
    }
    counterPlatform.subscribe({ event: 'Counter::counterUpdated', callback })
    
    // export controller and presenter to view
    function useController() {
        function increment() {
            counterPlatform.increment()
        }
        return {
            increment,
        }
    }
    function usePresenter() {
        return {
            counter,
            tooBig: counter > 5,
        }
    }
    return {
        useController,
        usePresenter,
    }
}