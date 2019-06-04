import { useLayoutEffect, useRef, useCallback } from 'react'
import produce, { Draft } from 'immer'
import useForceUpdate from 'use-force-update'
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

    public useStore<Result= T> (selector: Selector<T,(Result | T) > = passThrough, deps: any[] = []): Result {
        const currSelector = useCallback(selector, deps)

        const selectorRef = useRef(selector)
        useLayoutEffect(() => { selectorRef.current = currSelector }, deps)

        const stateRef = useRef<Result>()
        if (stateRef.current === undefined || currSelector !== selectorRef.current) {
            stateRef.current = selector(this._state) as Result
        }

        const forceUpdate = useForceUpdate()

        useLayoutEffect(() => this.subscribe(() => {
            const nextState = selectorRef.current(this._state) as Result
            if (!equal(stateRef.current, nextState)) {
                stateRef.current = nextState
                forceUpdate()
            }
        }), [])

        return stateRef.current
    }
}

function passThrough<T> (val: T) { return val }

export function createStore<T extends object> (initialState: T) {
    return new Store(initialState)
}

export default createStore
