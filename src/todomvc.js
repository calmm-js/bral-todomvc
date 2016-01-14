import Bacon           from "baconjs"
import React           from "react"
import ReactDOM        from "react-dom"
import {Model as Atom} from "bacon.model"

import {classes, A, Button, Input, InputValue, UL, Span} from "bacon.react.html"

const model = initialRaw => {
  const initial = initialRaw.map((item, id) => ({...item, id}))
  const itemsAtom = Atom(initial)
  let counter = initial.length

  const addItem = title =>
    itemsAtom.modify(is => is.concat({id: counter++, title, isDone: false}))

  const setItem = ({id, title, isDone}) =>
    itemsAtom.modify(is =>
    is.map(i => i.id === id ? {id, title, isDone} : i))

  const remItem = ({id}) =>
    itemsAtom.modify(is => is.filter(i => i.id !== id))

  const toggleAll = () =>
    itemsAtom.modify(is =>
    is.map(is.some(i => !i.isDone)
           ? (i => ({...i, isDone: true}))
           : (i => ({...i, isDone: false}))))

  const clean = () => itemsAtom.modify(is => is.filter(i => !i.isDone))

  return {all: itemsAtom,
          active: itemsAtom.map(is => is.filter(i => !i.isDone)),
          completed: itemsAtom.map(is => is.filter(i => i.isDone)),
          addItem, setItem, remItem, toggleAll, clean}
}

const web = m => {
  const routes = [{hash: "#/",          items: m.all,       title: "All"},
                  {hash: "#/active",    items: m.active,    title: "Active"},
                  {hash: "#/completed", items: m.completed, title: "Completed"}]

  const routeAtom = Atom()
  window.onhashchange = () =>
    routeAtom.set(routes.find(r => r.hash === window.location.hash) || routes[0])
  window.onhashchange()

  const editingAtom = Atom(null)
  const newAtom = Atom("")

  const todos = (editing, items) =>
    items.map(({id, title, isDone}) =>
      <li key={id} className={classes(isDone && "completed",
                                      editing === id && "editing")}>
        <input className="toggle" type="checkbox" checked={isDone}
               onChange={() => m.setItem({id, title, isDone: !isDone})}/>
        <label onDoubleClick={() => editingAtom.set(id)}
               className="view">{title}</label>
        <button className="destroy" onClick={() => m.remItem({id})}/>
        {editing !== id ? null : (() => {
          const textAtom = Atom(title)
          const exit = () => editingAtom.set(null)
          const save = () =>
            {const newTitle = textAtom.get().trim()
             exit()
             newTitle !== "" && m.setItem({id, title: newTitle, isDone})}
          return <InputValue didMount={c => c && c.focus()} type="text"
                   value={textAtom} className="edit" onBlur={save}
                   onKeyDown={e => e.which === 13 && save() ||
                                   e.which === 27 && exit()}/>})()}
      </li>)

  return <div>
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <InputValue type="text" value={newAtom} className="new-todo"
           placeholder="What needs to be done?"
           onKeyDown={e => {
             const t = newAtom.get().trim()
             e.which === 13 && t !== "" && m.addItem(t) && newAtom.set("")}}/>
      </header>
      <section className="main">
        <Input className="toggle-all" onChange={m.toggleAll}
          type="checkbox" checked={m.active.map(a => a.length === 0)}/>
        <UL className="todo-list">{routeAtom.flatMapLatest(
          ({items}) => Bacon.combineWith(editingAtom, items, todos))}</UL>
      </section>
      <footer className="footer">
        <Span className="todo-count">{m.active.map(
          i => `${i.length} item${i.length === 1 ? "" : "s"}`)}</Span>
        <ul className="filters">{routes.map(r => <li key={r.title}>
            <A className={routeAtom.map(
                 cr => classes(cr.hash === r.hash && "selected"))}
               onClick={() => window.location.hash = r.hash}>{r.title}</A>
          </li>)
        }</ul>
        <Button className="clear-completed" onClick={m.clean}
                hidden={m.completed.map(c => c.length === 0)}>
          Clear completed</Button>
      </footer>
    </section>
    <footer className="info"><p>Double-click to edit a todo</p></footer>
  </div>
}

const storeKey = "react.bacon-todos"

const m = model(JSON.parse(localStorage.getItem(storeKey) || "[]"))
m.all.onValue(is => localStorage.setItem(storeKey, JSON.stringify(is)))

ReactDOM.render(web(m), document.getElementById("app"))
