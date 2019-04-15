import test from 'ava'
import { renderHook, act } from 'react-hooks-testing-library'
import { createElement, Fragment } from 'react'
import createStore from '../src'
import './_browser'

test('render, update', t => {
    const store = createStore({ n: 0 })
    const { result } = renderHook(() => store.useStore())

    t.deepEqual(result.current, { n: 0 })

    act(() => {
        store.update(s => { s.n++ })
    })

    t.deepEqual(result.current, { n: 1 })
})

test('rendering should not be done twice in nested components.', t => {
    const store = createStore({ val: 'hello' })
    let calls = 0

    const wrapper = ({ children }: any) => {
        store.useStore(s => s.val)
        calls++
        return createElement(Fragment, undefined, children)
    }

    renderHook(() => {
        calls++
        return store.useStore(s => s.val)
    }, { wrapper : wrapper as any })

    t.is(calls, 2)

    act(() => {
        store.update(s => {
            s.val = 'world'
        })
    })
    t.is(calls, 4)
})
