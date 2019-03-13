import test from 'ava'
import { renderHook, act } from 'react-hooks-testing-library'
import createStore from '../src'
import './_browser'

test('render, update', t => {
    const store = createStore({ n: 0 })
    const { result } = renderHook(() => store.useStore())

    t.deepEqual(result.current, { n: 0 })

    act(() => {
        store.update(s => {
            s.n++
        })
    })

    t.deepEqual(result.current, { n: 1 })
})
