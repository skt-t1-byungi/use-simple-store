import { useEffect, useState, useCallback, useRef } from 'react'
import produce from 'immer'
import equal from 'fast-deep-equal'

type Listener<T> = (state: T) => void
type Mutator<T> = (state: T) => T
type Selector<T,Result> = (state: T) => Result

export class MiniStore<T extends object> {
    private _state: T
    private _listeners: Array<Listener<T>> = []

    constructor (initialState: T) {
        this._state = Object(initialState)
        this.getState = this.getState.bind(this)
        this.update = this.update.bind(this)
        this.subscribe = this.subscribe.bind(this)
        this.useStore = this.useStore.bind(this)
    }

    public getState (): Readonly<T> {
        return { ...this._state }
    }

    public update (mutate: Mutator<T>) {
        const nextState = produce(this._state, mutate) as T
        if (equal(this._state, nextState)) return

        this._state = nextState
        this._listeners.forEach(fn => fn(this._state))
    }

    public subscribe (listener: Listener<T>) {
        this._listeners.push(listener)

        return () => {
            this._listeners.splice(this._listeners.indexOf(listener), 1)
        }
    }

    public useStore<Result= T> (selector?: Selector<T,Result>, deps: any[] = []) {
        if (!selector) selector = passThrough as Selector<T,Result>

        selector = useCallback(selector, deps)
        const [state, setState] = useState(() => selector!(this._state))

        const ref = useRef(state)
        useEffect(() => { ref.current = state }, [state])

        useEffect(() => {
            const listener = () => {
                const nextState = selector!(this._state)
                if (!equal(ref.current, nextState)) setState(nextState)
            }
            return this.subscribe(listener)
        }, [selector])

        return state
    }
}

function passThrough<T> (val: T) { return val }

export function createStore<T extends object> (initialState: T) {
    return new MiniStore(initialState)
}

export default createStore
