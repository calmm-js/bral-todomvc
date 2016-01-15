import Bacon    from "baconjs"
import R        from "ramda"
import React    from "react"
import ReactDOM from "react-dom"
import {Model}  from "bacon.model"
import B, {classes, set} from "bacon.react.html"

const model = init => {
  const all = Model(init.map((item, id) => ({...item, id})))
  let counter = init.length
  return {
    all,
    active: all.map(R.filter(i => !i.isDone)),
    completed: all.map(R.filter(i => i.isDone)),
    addItem: title =>
      all.modify(R.append({id: counter++, title, isDone: false})),
    setItem: ({id, title, isDone}) =>
      all.modify(R.map(i => i.id === id ? {id, title, isDone} : i)),
    remItem: ({id}) => all.modify(R.filter(i => i.id !== id)),
    toggleAll: () =>
      all.modify(is => {const isDone = is.some(i => !i.isDone)
                        return is.map(i => ({...i, isDone}))}),
    clean: () => all.modify(R.filter(i => !i.isDone))
  }
}

const hash = Bacon.fromEvent(window, "hashchange").toProperty(0)
             .map(() => window.location.hash)

const web = m => {
  const routes = [{hash: "#/",          items: m.all,       title: "All"},
                  {hash: "#/active",    items: m.active,    title: "Active"},
                  {hash: "#/completed", items: m.completed, title: "Completed"}]

  const route = hash.map(h => R.find(r => r.hash === h, routes) || routes[0])
  const items = route.flatMapLatest(r => r.items)

  const editing = Model(null)
  const newTodo = Model("")

  return <div>
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <B.input type="text" className="new-todo" autoFocus value={newTodo}
           onChange={set(newTodo)} placeholder="What needs to be done?"
           onKeyDown={e => {
             const t = newTodo.get().trim()
             e.which === 13 && t !== "" && m.addItem(t) && newTodo.set("")}}/>
      </header>
      <section className="main">
        <B.input className="toggle-all" onChange={m.toggleAll}
          type="checkbox" checked={m.active.map(a => a.length === 0)}/>
        <B.ul className="todo-list">{items.map(R.map(({id, title, isDone}) =>
          <B.li key={id} className={editing.map(e =>
              classes(isDone && "completed", e === id && "editing"))}>
            <input className="toggle" type="checkbox" checked={isDone}
                   onChange={() => m.setItem({id, title, isDone: !isDone})}/>
            <label onDoubleClick={() => editing.set(id)}
                   className="view">{title}</label>
            <button className="destroy" onClick={() => m.remItem({id})}/>
            {editing.map(e => e !== id ? null : (() => {
              const text = Model(title)
              const exit = () => editing.set(null)
              const save = () =>
                {const newTitle = text.get().trim()
                 exit()
                 newTitle === "" ? m.remItem({id})
                                 : m.setItem({id, title: newTitle, isDone})}
              return <B.input type="text" onChange={set(text)} onBlur={save}
                       className="edit" value={text} mount={c => c && c.focus()}
                       key="x" onKeyDown={e => e.which === 13 && save() ||
                                               e.which === 27 && exit()}/>})())}
          </B.li>))}</B.ul>
      </section>
      <B.footer className="footer" hidden={m.all.map(a => a.length === 0)}>
        <B.span className="todo-count">{m.active.map(
          i => `${i.length} item${i.length === 1 ? "" : "s"}`)}</B.span>
        <ul className="filters">{routes.map(r => <li key={r.title}>
            <B.a href={r.hash} className={route.map(
              cr => classes(cr.hash === r.hash && "selected"))}>{r.title}</B.a>
          </li>)}</ul>
        <B.button className="clear-completed" onClick={m.clean}
                  hidden={m.completed.map(a => a.length === 0)}>
          Clear completed</B.button>
      </B.footer>
    </section>
    <footer className="info"><p>Double-click to edit a todo</p></footer>
  </div>
}

const storeKey = "react.bacon-todos"

const m = model(JSON.parse(localStorage.getItem(storeKey) || "[]"))
m.all.onValue(is => localStorage.setItem(storeKey, JSON.stringify(is)))

ReactDOM.render(web(m), document.getElementById("app"))
