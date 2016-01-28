import Atom from "bacon.atom"
import B, {bind, classes} from "bacon.react.html"
import Bacon from "baconjs"
import L from "partial.lenses"
import R from "ramda"
import React from "react"
import ReactDOM from "react-dom"
import uuid from "uuid"
import {matches} from "schemation"

const hash = Bacon.fromEvent(window, "hashchange").toProperty(0)
             .map(() => window.location.hash)

const TodoItem = ({model, editing = Atom(false)}) =>
  <B.li {...classes(B(model.lens(L("completed")), c => c && "completed"),
                    B(editing, e => e && "editing"))}>
    <B.input className="toggle" type="checkbox" hidden={editing}
             {...bind({checked: model.lens(L("completed"))})}/>
    <B.label onDoubleClick={() => editing.set(true)}
             className="view">{model.lens(L("title"))}</B.label>
    <button className="destroy" onClick={() => model.set()}/>
    {B(editing, e => e && (() => {
      const exit = () => editing.set(false)
      const save = e =>
        {const newTitle = e.target.value.trim()
         exit()
         newTitle === "" ? model.set()
                         : model.lens(L("title")).set(newTitle)}
      return <B.input type="text" onBlur={save} className="edit" key="x"
               mount={c => c && c.focus()} defaultValue={model.lens(L("title"))}
               onKeyDown={e => e.which === 13 && save(e) ||
                               e.which === 27 && exit()}/>})())}
  </B.li>

const TodoApp = ({model: m}) => {
  const routes = [{hash: "#/",          items: m.all,       title: "All"},
                  {hash: "#/active",    items: m.active,    title: "Active"},
                  {hash: "#/completed", items: m.completed, title: "Completed"}]

  const route = B(hash, h => R.find(r => r.hash === h, routes) || routes[0])
  const ids = B(route.flatMapLatest(r => r.items), R.map(R.prop("id")))

  return <div>
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        <input type="text" className="new-todo" autoFocus
           placeholder="What needs to be done?" onKeyDown={e => {
             const t = e.target.value.trim()
             if (e.which === 13 && t !== "") {
               m.addItem({title: t}); e.target.value = ""}}}/>
      </header>
      <section className="main">
        <B.input type="checkbox" className="toggle-all" hidden={m.isEmpty}
          {...bind({checked: m.allDone})}/>
        <B.ul className="todo-list">{B(ids, R.map(id =>
          <TodoItem key={id} model={m.all.lens(L.find(matches({id})))}/>))}</B.ul>
      </section>
      <B.footer className="footer" hidden={m.isEmpty}>
        <B.span className="todo-count">{B(m.active,
          i => `${i.length} item${i.length === 1 ? "" : "s"}`)}</B.span>
        <ul className="filters">{routes.map(r => <li key={r.title}>
            <B.a {...classes(route.map(cr => cr.hash === r.hash && "selected"))}
               href={r.hash}>{r.title}</B.a>
          </li>)}</ul>
        <B.button className="clear-completed" onClick={m.clean}
                  hidden={B(m.completed, a => a.length === 0)}>
          Clear completed</B.button>
      </B.footer>
    </section>
    <footer className="info"><p>Double-click to edit a todo</p></footer>
  </div>
}

TodoApp.model = (all = Atom([])) => ({
  all,
  isEmpty: B(all, a => a.length === 0),
  active: B(all, R.filter(i => !i.completed)),
  completed: B(all, R.filter(i => i.completed)),
  addItem: ({id = uuid.v4(), title, completed = false}) =>
    all.modify(R.append({id, title, completed})),
  allDone: all.lens(L.lens(
    R.all(i => i.completed),
    (completed, items) => items.map(i => ({...i, completed})))),
  clean: () => all.modify(R.filter(i => !i.completed))
})

const storeKey = "todos-react.bacon"

const m = TodoApp.model(Atom(JSON.parse(localStorage.getItem(storeKey) || "[]")))
m.all.onValue(is => localStorage.setItem(storeKey, JSON.stringify(is)))

ReactDOM.render(<TodoApp model={m}/>, document.getElementById("app"))
