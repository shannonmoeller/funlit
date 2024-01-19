# 🪵 funlit

Function Lit elements with reactive attributes, properties, and values. Light DOM by default.

[Live demo](https://shannonmoeller.github.io/funlit).

## Install

```
$ npm install funlit lit-html
```

```html
<script type="importmap">
  {
    "imports": {
      "funlit": "https://unpkg.com/funlit",
      "lit-html": "https://unpkg.com/lit-html"
    }
  }
</script>
```

## Usage

```js
import { define, attr, html } from 'funlit';

function MyStepper() {
  const count = attr('count', 0, { parse: Number });

  function decrement() {
    count.value--;
  }

  function increment() {
    count.value++;
  }

  return () => html`
    <button @click=${decrement}>-</button>
    ${count}
    <button @click=${increment}>+</button>
  `;
}

define('my-stepper', MyStepper);
```

```html
<my-stepper></my-stepper>

<my-stepper count="10"></my-stepper>

<script type="module">
  const stepper = document.createElement('my-stepper');
  stepper.count = 20;
  document.body.append(stepper);
</script>
```

## API

### html, svg, nothing

This package reexports `html`, `svg`, and `nothing` from [lit-html](https://npm.im/lit-html) as a convenience. Anything else you might need (such as directives) should be imported from `lit-html` itself.

### define(tag, init)

Alias: `defineElement`

TODO

### attr(key[, value[, options]])

Alias: `defineAttribute`

TODO

### prop(key[, value[, options]])

Alias: `defineProperty`

TODO

### val([value[, options]])

Alias: `defineValue`

TODO

## Lifecycle

### init(host)

To define an element, you specify a tag name and an `init` function. The `init` function is called once per instance of the element (the first time the element is connected) and is passed a reference to the element. [Native lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks) are emitted as `adopt`, `connect`, and `disconnect` non-bubbling events, as well as an `update` event after each render.

```js
define('my-thing', (host) => {
  host.addEventListener('adopt', () => {});
  host.addEventListener('connect', () => {});
  host.addEventListener('disconnect', () => {});
  host.addEventListener('update', () => {});
});
```

### host.update()

The `update` method is automatically called any time a defined attribute, property, or value changes. Updates are batched so it's safe to update any number of values at a time without causing unnecessary rerenders. It may also be called directly as desired. Returns a promise that resolves after the resulting rerender happens.

### host.updateComplete

The same promise as is returned by `.update()`.

----

MIT © [Shannon Moeller](http://shannonmoeller.com)
