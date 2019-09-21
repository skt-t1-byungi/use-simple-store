import { renderHook, act } from '@testing-library/react-hooks'
import createStore from '../src'
import bench = require('nanobench')
import browserEnv = require('browser-env')
import range = require('lodash.range')

browserEnv()

bench('test', b => {
    const { update, useStore } = createStore({
        items: range(1000).map(() => range(100))
    })
    renderHook(() => useStore())

    b.start()
    for (let i = 0; i < 1000; i++) {
        act(() => update(s => {
            s.items[s.items.length - 1].push(0)
        }))
    }
    b.end()
})
