import test from 'ava'
import createStore from '../src'

test('getState, update', t => {
    const store = createStore({ val: 'test' })
    t.deepEqual(store.getState(), { val: 'test' })
    store.update(s => { s.val = 'update' })
    t.deepEqual(store.getState(), { val: 'update' })
})

test('subscribe, unsubscribe', t => {
    t.plan(1)

    const store = createStore({ val: 'test' })
    const unsubscribe = store.subscribe(s => {
        t.deepEqual(s, { val: 'update1' })
    })

    store.update(s => { s.val = 'update1' })
    unsubscribe()
    store.update(s => { s.val = 'update2' })
})

test('If the state does not change, do not emit.', t => {
    t.plan(1)
    const store = createStore({ val: 'test' })
    store.subscribe(() => t.pass())
    store.update(s => { s.val = 'test' })
    store.update(s => { s.val = 'test' })
    store.update(s => { s.val = 'change' })
    store.update(s => { s.val = 'change' })
})
