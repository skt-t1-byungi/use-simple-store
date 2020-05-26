import { Dispatch, useCallback, useLayoutEffect, useReducer, useRef } from 'react'
import equal from 'dequal'
import produce, { Draft } from 'immer'

type Listener<T> = (state: T) => void
type Mutator<T> = (state: Draft<T>) => void
type Selector<T, Result> = (state: T) => Result

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

    getState (): Readonly<T> {
        return this._state
    }

    update (mutate: Mutator<T>) {
        const nextState = produce(this._state, draft => mutate(draft))
        if (this._state !== (this._state = nextState)) {
            this._listeners.forEach(fn => fn(this._state))
        }
    }

    subscribe (listener: Listener<T>) {
        this._listeners.push(listener)
        return () => void this._listeners.splice(this._listeners.indexOf(listener), 1)
    }

    useStore<F extends Selector<T, any>= Selector<T, T>> (
        selector: F = passThrough as any,
        deps: any[] = []
    ): ReturnType<F> {
        const currSelector = useCallback(selector, deps)
        const selectorRef = useRef(selector)
        const stateRef = useRef<ReturnType<F>>()
        const forceUpdate: Dispatch<void> = useReducer(() => ({}), {})[1]

        useLayoutEffect(() => { selectorRef.current = currSelector })

        if (stateRef.current === undefined || currSelector !== selectorRef.current) {
            stateRef.current = currSelector(this._state)
        }

        useLayoutEffect(() => this.subscribe(() => {
            const nextState = selectorRef.current(this._state)
            if (!equal(stateRef.current, nextState)) {
                stateRef.current = nextState
                forceUpdate()
            }
        }), [])

        return stateRef.current as ReturnType<F>
    }
}

function passThrough<T> (val: T) { return val }

export function createStore<T extends object> (initialState: T) {
    return new Store(initialState)
}

export default createStore
