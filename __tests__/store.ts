import createStore from '../src'

test('getState(), update()', () => {
    const store = createStore({ n: 0 })

    expect(store.getState()).toEqual({ n: 0 })
    store.update(s => {
        s.n++
    })
    expect(store.getState()).toEqual({ n: 1 })
    store.update(s => {
        s.n++
    })
    expect(store.getState()).toEqual({ n: 2 })
})

test('subscribe(), unsubscribe()', () => {
    const store = createStore({ n: 0 })
    const mo = jest.fn()

    const unsubscribe = store.subscribe(mo)
    store.update(s => {
        s.n++
    })
    unsubscribe()
    store.update(s => {
        s.n++
    })

    expect(mo.mock.calls.length).toBe(1)
})

test('Only runs when the state changes.', () => {
    const store = createStore({ v: 'a' })
    const mo = jest.fn()
    store.subscribe(mo)

    store.update(s => {
        s.v = 'a'
    })
    store.update(s => {
        s.v = 'a'
    })
    store.update(s => {
        s.v = 'b'
    })
    store.update(s => {
        s.v = 'b'
    })

    expect(mo.mock.calls.length).toBe(1)
})

test('Update with replacement', () => {
    const store = createStore({ a: '1' })
    store.update(() => ({ b: '2' }))
    expect(store.getState()).toEqual({ b: '2' })
})
