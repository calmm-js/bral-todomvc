This is an example of using React with
[Bacon.React.HTML](https://github.com/polytypic/bacon.react.html) and
[Bacon.Model](https://github.com/baconjs/bacon.model) to implement a reactive
model and UI.

For some time now, we have actually been using this approach, namely

* storing state in mutable Bacon.Model objects,
* potentially using lenses to access such state,
* specifying all kinds of state dependent computations as Bacon streams and
  properties, and
* embedding such streams and properties directly into React Virtual DOM

in production.  It just works.

To test locally

```bash
git clone https://github.com/polytypic/atomi-todomvc.git
cd atomi-todomvc
npm install
npm run build
```

and then point browser to `atomi-todomvc/public/index.html`.
