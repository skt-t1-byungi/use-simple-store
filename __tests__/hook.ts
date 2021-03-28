import { act, renderHook } from '@testing-library/react-hooks'

import createStore from '../src'

test('render, update', () => {
    const store = createStore({ n: 0 })
    const { result } = renderHook(() => store.useStore())

    expect(result.current).toEqual({ n: 0 })
    act(() =>
        store.update(s => {
            s.n++
        })
    )

    expect(result.current).toEqual({ n: 1 })
})

test('Selector replacement', () => {
    const store = createStore({ a: 1, b: 2 })
    const { result, rerender } = renderHook(p => store.useStore(s => s[p ? 'a' : 'b'], [p]), { initialProps: true })

    expect(result.current).toBe(1)
    rerender(false)
    expect(result.current).toBe(2)
})

test('Update during render', () => {
    const store = createStore({ n: 0 })
    let once = 0
    const { result } = renderHook(() => {
        const ret = store.useStore()
        if (!once++)
            store.update(s => {
                s.n++
            })
        return ret
    })
    expect(result.current.n).toBe(1)
})
