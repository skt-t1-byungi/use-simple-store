import { useCallback } from 'react'
import produce, { Draft } from 'immer'
import shallowEqual from 'shallowequal'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'

type Listener<T> = (state: T) => void
type Mutator<T> = (state: Draft<T>) => void
type Selector<T, Result> = (state: T) => Result

export class Store<T> {
    private _state: T
    private _listeners: Array<Listener<T>> = []

    constructor(initialState: T) {
        this._state = Object(initialState)
        this.getState = this.getState.bind(this)
        this.update = this.update.bind(this)
        this.subscribe = this.subscribe.bind(this)
        this.useStore = this.useStore.bind(this)
    }

    getState(): Readonly<T> {
        return this._state
    }

    update(mutate: Mutator<T>) {
        const nextState = produce(this._state, mutate)
        if (this._state !== (this._state = nextState)) {
            this._listeners.forEach(fn => fn(this._state))
        }
    }

    subscribe(listener: Listener<T>) {
        this._listeners.push(listener)
        return () => void this._listeners.splice(this._listeners.indexOf(listener), 1)
    }

    useStore<F extends Selector<T, any> = Selector<T, T>>(
        selector: F = passThrough as any,
        deps: any[] = []
    ): ReturnType<F> {
        return useSyncExternalStoreWithSelector(
            this.subscribe,
            this.getState,
            this.getState,
            useCallback(selector, deps),
            shallowEqual
        )
    }
}

function passThrough<T>(val: T) {
    return val
}

export function createStore<T>(initialState: T) {
    return new Store(initialState)
}

export default createStore
