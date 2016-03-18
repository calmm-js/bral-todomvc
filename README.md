[![Build Status](https://travis-ci.org/calmm-js/bral-todomvc.svg?branch=master)](https://travis-ci.org/calmm-js/bral-todomvc) [![](https://david-dm.org/calmm-js/bral-todomvc.svg)](https://david-dm.org/calmm-js/bral-todomvc) [![](https://david-dm.org/calmm-js/bral-todomvc/dev-status.svg)](https://david-dm.org/calmm-js/bral-todomvc#info=devDependencies) [![Gitter](https://img.shields.io/gitter/room/calmm-js/chat.js.svg?style=flat-square)](https://gitter.im/calmm-js/chat)

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
git clone https://github.com/calmm-js/bral-todomvc.git
cd bral-todomvc
npm install
```

and then `open public/index.html`.
