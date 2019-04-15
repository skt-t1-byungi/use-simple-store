import { useEffect, useState, useRef } from 'react'
import produce, { Draft } from 'immer'
import equal = require('fast-deep-equal')

type Listener<T> = (state: T) => void
type Mutator<T> = (state: Draft<T>) => void
type Selector<T,Result> = (state: T) => Result

export class Store<T extends object> {
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
        return this._state
    }

    public update (mutate: Mutator<T>) {
        const nextState = produce(this._state, draft => mutate(draft))
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

    public useStore<Result= T> (selector?: Selector<T,Result>) {
        if (!selector) selector = passThrough as Selector<T,Result>

        const [state, setState] = useState(() => selector!(this._state))

        const prevRef = useRef(state)
        useEffect(() => { prevRef.current = state }, [state])

        useEffect(() => {
            const listener = () => {
                const nextState = selector!(this._state)
                if (!equal(prevRef.current, nextState)) setState(nextState)
            }
            return this.subscribe(listener)
        }, [])

        return state
    }
}

function passThrough<T> (val: T) { return val }

export function createStore<T extends object> (initialState: T) {
    return new Store(initialState)
}

export default createStore
