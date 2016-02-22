import Atom from "bacon.atom"
import B, {bind, classes, fromIds} from "bacon.react.html"
import Bacon from "baconjs"
import L from "partial.lenses"
import R from "ramda"
import React from "react"
import ReactDOM from "react-dom"

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
  const routes = [{hash: "#/",          filter: () => true, title: "All"},
                  {hash: "#/active",    filter: active,     title: "Active"},
                  {hash: "#/completed", filter: completed,  title: "Completed"}]

  const route = B(hash, h => R.find(r => r.hash === h, routes) || routes[0])
  const indices = B(m.all, route, (all, {filter}) =>
                    R.flatten(all.map((it, i) => filter(it) ? [i] : [])))

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
        <B.ul className="todo-list">{fromIds(indices, i =>
          <TodoItem key={i} model={m.all.lens(L(i))}/>)}</B.ul>
      </section>
      <B.footer className="footer" hidden={m.isEmpty}>
        <B.span className="todo-count">{B(B(m.all, R.filter(active)),
          i => `${i.length} item${i.length === 1 ? "" : "s"} left`)}</B.span>
        <ul className="filters">{routes.map(r => <li key={r.title}>
            <B.a {...classes(route.map(cr => cr.hash === r.hash && "selected"))}
               href={r.hash}>{r.title}</B.a>
          </li>)}</ul>
        <B.button className="clear-completed" onClick={m.clean}
                  hidden={B(m.all, R.all(active))}>
          Clear completed</B.button>
      </B.footer>
    </section>
    <footer className="info"><p>Double-click to edit a todo</p></footer>
  </div>
}

const active = i => !i.completed
const completed = i => i.completed

TodoApp.model = (all = Atom([])) => ({
  all: all.lens(L.define([])),
  isEmpty: B(all, a => a.length === 0),
  addItem: ({title, completed = false}) =>
    all.modify(R.append({title, completed})),
  allDone: all.lens(L.lens(
    R.all(completed),
    (completed, items) => items.map(i => ({...i, completed})))),
  clean: () => all.modify(R.filter(active))
})

const storeKey = "todos-react.bacon"

const m = TodoApp.model(Atom(JSON.parse(localStorage.getItem(storeKey) || "[]")))
m.all.onValue(is => localStorage.setItem(storeKey, JSON.stringify(is)))

ReactDOM.render(<TodoApp model={m}/>, document.getElementById("app"))
