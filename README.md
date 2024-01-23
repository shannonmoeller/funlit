# 🪵 funlit

Function [Lit](https://npm.im/lit-html) elements with reactive attributes, properties, and values. Light DOM by default.

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

```html
<script type="module">
  import { define, attr, html } from 'funlit';

  function MyStepper(host) {
    const count = attr(host, 'count', 0, { parse: Number });

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
</script>

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

TODO: document api and return value

### attr(host, key[, value[, options]])

Alias: `defineAttribute`

TODO: document api and return value

### prop(host, key[, value[, options]])

Alias: `defineProperty`

TODO: document api and return value

### val(host, value[, options])

Alias: `defineValue`

TODO: document api and return value

## Host

### init(host)

To define an element you specify a tag name and an `init` function. The `init` function is called once per instance of the element (the first time the element is connected) with a reference to the element.

### Lifecycle callbacks

[Native lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks) are emitted as non-bubbling `adopt`, `connect`, and `disconnect` events. There is no `attributechange` event emitted as attribute changes are handled with [`attr()`](#attrhost-key-value-options).

```js
define('my-element', (host) => {
  host.addEventListener('adopt', () => { /* ... */ });
  host.addEventListener('connect', () => { /* ... */ });
  host.addEventListener('disconnect', () => { /* ... */ });
  host.addEventListener('update', () => { /* ... */ });
});
```

### host.update(), host.updateComplete

The `.update()` method is automatically called any time the element is connected or a defined attribute, property, or value changes, but may also be called directly. Updates are batched so it's safe to trigger any number of updates at a time without causing unnecessary rerenders. Returns a promise that resolves after the resulting rerender happens and will trigger a non-bubbling `update` event.

The `connect` and `update` event handlers may make use of `host.updateComplete` to run code before or after a render.

```js
define('my-element', (host) => {
  async function refresh() {
    // before render
    await host.update();
    // after render
  }

  host.addEventListener('update', () => {
    // before render
    await host.updateCompleted;
    // after render
  });

  return () => html`
    {new Date()}
    <button @click=${refresh}>Refresh</button>
  `;
});
```

----

MIT © [Shannon Moeller](http://shannonmoeller.com)
