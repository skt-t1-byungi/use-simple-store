import { useEffect, useState, useCallback } from 'react'
import produce from 'immer'

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
        this._state = produce(this._state, mutate) as T
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

        useEffect(() => {
            const listener = () => setState(selector!(this._state))
            return this.subscribe(listener)
        }, [selector])

        return state
    }
}

function passThrough<T> (val: T) { return val }
