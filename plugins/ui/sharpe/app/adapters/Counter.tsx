'use client'
import { useState } from "react"
import { CounterEvent, counter as counterInteractor } from 'fire-app/ports'

export default function useCounterAdapter() {
    // local model state (react)
    const [counter, setCounter] = useState(0)
    // platform we depend on
    // subscribe to platform updates
    const callback = (data: unknown) => {
        setCounter(data as number)
    }
    counterInteractor.subscribe(CounterEvent.UPDATE, callback)
    
    // export controller and presenter to view
    function useController() {
        function increment() {
            counterInteractor.increment()
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