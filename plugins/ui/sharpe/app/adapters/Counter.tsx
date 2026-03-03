'use client'
import { useState } from "react"
import { CounterEventNames, useCounterPort, useMySharpePort } from 'fire-app/ports'

export default function useCounterAdapter() {
    // platform we depend on
    const { counter: initialCounter, increment, subscribe } = useCounterPort()
    const { mySharpe, mySharpeError } = useMySharpePort({ data: [1,2,3,4,5], ticker: 'AAPL', lookback: 2 })
    // local model state (react)
    const [counter, setCounter] = useState(initialCounter)
    
    // subscribe to platform updates
    const callback = (data: unknown) => {
        setCounter(data as number)
    }
    subscribe(CounterEventNames.UPDATE, callback)
    
    // export controller and presenter to view
    function useController() {
        return {
            increment,
        }
    }
    function usePresenter() {
        return {
            counter,
            tooBig: counter > 5,
            mySharpe,
            mySharpeError,
        }
    }
    return {
        useController,
        usePresenter,
    }
}