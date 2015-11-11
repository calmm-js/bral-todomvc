import React from "react"
import ReactDOM from "react-dom"
import Bacon from "baconjs"
import {Model as Atom} from "bacon.model"
import Reify from "bacon.react"

const normalizeIds = (all) =>
  (i => all.map(item => ({...item, id: i++})))(0)

const model = (initialRaw) => {
  const initial = normalizeIds(initialRaw || [])

  const itemsAtom = Atom(initial)
  const counterAtom = Atom(initial.length)

  const inc = () =>
    {const i = counterAtom.get()
     counterAtom.set(i+1)
     return i}

  const addItem = title =>
    itemsAtom.modify(is => is.concat({id: inc(), title, isDone: false}))

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

const textInput = ({text, placeholder, className, save, exit}) => {
  const textAtom = Atom(text || "")
  const Exit = _ => {textAtom.set(""); !exit || exit()}
  const Save = _ => {
    const title = textAtom.get().trim()
    title !== "" && save(title)
    Exit()
  }
  return <Reify didMount={c => ReactDOM.findDOMNode(c).focus()}>
    <input className={className} type="text" placeholder={placeholder}
       onChange={e => textAtom.set(e.target.value)}
       onBlur={Save} value={textAtom}
       onKeyDown={e => e.which === 13 ? Save() :
                       e.which === 27 ? Exit() : null}/>
  </Reify>
}

const web = m => {
  const filterAtom = Atom(m.all)
  const editingAtom = Atom(null)

  const filterItem = (title, stream) =>
    <li key={title}>
      <a className={filterAtom.map(f => f === stream ? "selected" : "")}
         onClick={_ => filterAtom.set(stream)}>{title}</a>
    </li>

  const todos = (editing, items) =>
    items.map(({id, title, isDone}) =>
      <li key={id} className={(isDone ? "completed " : "") +
                              (editing === id ? "editing" : "")}>
        <input className="toggle" type="checkbox" checked={isDone}
               onChange={_ => m.setItem({id, title, isDone: !isDone})}/>
        <label onDoubleClick={_ => editingAtom.set(id)}
               className="view">{title}</label>
        <button className="destroy" onClick={_ => m.remItem({id})}/>
        {editing === id
         ? textInput({text: title, className: "edit",
                      save: title => m.setItem({id, title, isDone}),
                      exit: () => editingAtom.set(null)})
         : null}
      </li>)

  return <Reify>
    <section className="todoapp">
      <header className="header">
        <h1>todos</h1>
        {textInput({className: "new-todo", save: m.addItem,
                    placeholder: "What needs to be done?"})}
      </header>
        <section className="main">
          <input className="toggle-all" onChange={m.toggleAll}
           type="checkbox" checked={m.active.map(a => a.length === 0)}/>
          <ul className="todo-list">
            {filterAtom.flatMapLatest(items =>
             Bacon.combineWith(editingAtom, items, todos))}
          </ul>
        </section>
        <footer className="footer">
          <span className="todo-count">
            {m.active.map(i => i.length)} {
            m.active.map(i => i.length === 1 ? "item" : "items")} left
          </span>
          <ul className="filters">
            {filterItem("All", m.all)}
            {filterItem("Active", m.active)}
            {filterItem("Completed", m.completed)}
          </ul>
          {m.completed.map(completed =>
           completed.length !== 0
           ? <button className="clear-completed" onClick={m.clean}>
               Clear completed {completed.length}</button>
           : null)}
        </footer>
    </section>
    <footer className="info"><p>Double-click to edit a todo</p></footer>
  </Reify>
}

const storeKey = "react.bacon-todos"

const m = model(JSON.parse(localStorage.getItem(storeKey) || "[]"))
m.all.onValue(is => localStorage.setItem(storeKey, JSON.stringify(is)))

ReactDOM.render(web(m), document.getElementById("app"))
