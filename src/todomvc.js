import Bacon    from "baconjs"
import R        from "ramda"
import React    from "react"
import ReactDOM from "react-dom"
import {Model}  from "bacon.model"
import B, {bind, classes} from "bacon.react.html"

const model = init => {
  const all = Model(init.map((item, id) => ({...item, id})))
  let counter = init.length
  return {
    all,
    isEmpty: all.map(a => a.length === 0),
    active: all.map(R.filter(i => !i.completed)),
    completed: all.map(R.filter(i => i.completed)),
    addItem: title =>
      all.modify(R.append({id: counter++, title, completed: false})),
    setItem: ({id, title, completed}) =>
      all.modify(R.map(i => i.id === id ? {id, title, completed} : i)),
    remItem: ({id}) => all.modify(R.filter(i => i.id !== id)),
    allDone: all.lens({
      get: R.all(i => i.completed),
      set: (items, completed) => items.map(i => ({...i, completed}))}),
    clean: () => all.modify(R.filter(i => !i.completed))
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

  return <div>
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input type="text" className="new-todo" autoFocus
           placeholder="What needs to be done?" onKeyDown={e => {
             const t = e.target.value.trim()
             if (e.which === 13 && t !== "") {
               m.addItem(t); e.target.value = ""}}}/>
      </header>
      <section className="main">
        <B.input type="checkbox" className="toggle-all" hidden={m.isEmpty}
          {...bind({checked: m.allDone})}/>
        <B.ul className="todo-list">{items.map(R.map(({id, title, completed}) =>
          <B.li key={id} {...classes(completed && "completed",
                                     editing.map(e => e === id && "editing"))}>
            <input className="toggle" type="checkbox" checked={completed}
              onChange={() => m.setItem({id, title, completed: !completed})}/>
            <label onDoubleClick={() => editing.set(id)}
                   className="view">{title}</label>
            <button className="destroy" onClick={() => m.remItem({id})}/>
            {editing.map(e => e === id && (() => {
              const exit = () => editing.set(null)
              const save = e =>
                {const newTitle = e.target.value.trim()
                 exit()
                 newTitle === "" ? m.remItem({id})
                                 : m.setItem({id, title: newTitle, completed})}
              return <B.input type="text" onBlur={save} className="edit" key="x"
                       mount={c => c && c.focus()} defaultValue={title}
                       onKeyDown={e => e.which === 13 && save(e) ||
                                       e.which === 27 && exit()}/>})())}
          </B.li>))}</B.ul>
      </section>
      <B.footer className="footer" hidden={m.isEmpty}>
        <B.span className="todo-count">{m.active.map(
          i => `${i.length} item${i.length === 1 ? "" : "s"}`)}</B.span>
        <ul className="filters">{routes.map(r => <li key={r.title}>
            <B.a {...classes(route.map(cr => cr.hash === r.hash && "selected"))}
               href={r.hash}>{r.title}</B.a>
          </li>)}</ul>
        <B.button className="clear-completed" onClick={m.clean}
                  hidden={m.completed.map(a => a.length === 0)}>
          Clear completed</B.button>
      </B.footer>
    </section>
    <footer className="info"><p>Double-click to edit a todo</p></footer>
  </div>
}

const storeKey = "todos-react.bacon"

const m = model(JSON.parse(localStorage.getItem(storeKey) || "[]"))
m.all.onValue(is => localStorage.setItem(storeKey, JSON.stringify(is)))

ReactDOM.render(web(m), document.getElementById("app"))
