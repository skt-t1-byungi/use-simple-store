# use-simple-store 🏬
A very simple global state management using react hooks.

[![npm](https://flat.badgen.net/npm/v/use-simple-store)](https://www.npmjs.com/package/use-simple-store)
[![travis](https://flat.badgen.net/travis/skt-t1-byungi/use-simple-store)](https://travis-ci.org/skt-t1-byungi/use-simple-store)
[![license](https://flat.badgen.net/github/license/skt-t1-byungi/use-simple-store)](https://github.com/skt-t1-byungi/use-simple-store/blob/master/LICENSE)


## Install
```sh
npm i use-simple-store
```

## Example
```js
import createStore from 'use-simple-store'

const {useStore, update} = createStore({count: 0})

const increment = () => update(state => {
    state.count = state.count + 1
})

const decrement = () => update(state => {
    state.count = state.count - 1
})

function App() {
    const {count} = useStore()
    return (
        <div>
            <span>{count}</span>
            <button onClick={decrement}> - </button>
            <button onClick={increment}> + </button>
        </div>))
}
```

## API
### createStore(initialState)
Create a store.

### store.update([mutate])
Update the state by mutating. Use [immer](https://github.com/mweststrate/immer) internally.

```js
const addTodo = (id, text) => update(state => {
    state.todos[id] = { id, text, done: false }
})

const deleteTodo = id => update(state => {
    delete state.todos[id]
})
```
#### Asynchronous update.
The `update` function does not support promise. If you need an asynchronous update, see the example below: 👇

```js
async function fetchTodos() {
    update(state => {
        state.fetching = true
    })

    const todos = await fetchTodosAsync()

    update(state => {
        state.fetching = false
        state.todos = todos
    })
}
```

### store.subscribe(listener)
Subscribe to state changes.

```js
const {subscribe, update} = createStore({count: 0})

subscribe(state => {
    console.log(`count: ${state.count}`)
})

update(state => { state.count++ }) // => count: 1
update(state => { state.count++ }) // => count: 2
```

#### Unsubscribe
The `subscribe` returns a function to cancel the subscription.
```js
const unsubscribe = subscribe(listener)

/* ... */

unsubscribe()
```

### store.getState()
Returns current state.

### store.useStore([selector[, dependencies]])
A react hook to subscribe to store state changes.

#### selector
Select only the necessary state of the store. When the state of the store is large, its performance is better.

```js
function Todo({id}) {
    const todo = useStore(s => s.todos[id])

    const handleClick = () => {
        update(s => { s.todos[id].done = !todo.done })
    }

    return <li onClick={handleClick}>{todo.text}</li>)
}
```

#### dependencies
Replace the selector with `dependencies`.
```js
const s = useStore(state => state[condition ? 'v1':'v2'], [condition])
```

## License
MIT
