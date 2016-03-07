[![](https://david-dm.org/calmm-js/bacon.react.atom-todomvc.svg)](https://david-dm.org/calmm-js/bacon.react.atom-todomvc)

This is an example of using React with
[Bacon.React.HTML](https://github.com/calmm-js/bacon.react.html) and
[Bacon.Atom](https://github.com/calmm-js/bacon.atom) to implement a reactive
model and UI.

For some time now, we have actually been using this approach, namely

* storing state in mutable observable model objects,
* potentially using lenses to access such state,
* specifying all kinds of state dependent computations as Bacon streams and
  properties, and
* embedding such streams and properties directly into React Virtual DOM

in production.  It just works.

To test locally

```bash
git clone https://github.com/calmm-js/bacon.react.atom-todomvc.git
cd bacon.react.atom-todomvc
npm install
npm run build
```

and then point browser to `bacon.react.atom-todomvc/public/index.html`.
