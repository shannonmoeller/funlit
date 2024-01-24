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

### define(tagName, init)

Alias: `defineElement`

- `tagName` `{string}` Custom-element tag name to register.
- `init` `{(FunlitElement) => () => TemplateResult}` An initialization function that receives a host element instance, implements core features, and returns a renderer function.

Returns: `{FunlitElementConstructor}`

Defines a new custom element with the given tag name and `init` function. Returns the newly-created custom-element class.

The `init` function is only called once per instance of the element (the [host](#host)) the first time the element is connected. The function is passed a reference to the host which can be used to define attributes, properties, and values, as well as anything else you'd like. You can think of `init` like the constuctor, but it doesn't run until the element has been added to a document. Returns a render function which will be called on every update-render cycle.

```js
const MyCounterElement = define('my-counter', (host) => {
  const count = attr(host, 'count', 0, { parse: Number });

  function increment() {
    count.value++;
  }

  host.addEventListener('update', console.log);

  return () => html`
    ${count}
    <button @click=${increment}>+</button>
  `;
});
```

You may then use the element in HTML:

```html
<my-counter count="10"></my-counter>
```

Elements may also be created programmatically via the constructor:

```js
const counter = new MyCounterElement(); // does not fire `init`
conuter.count = 10;
document.body.append(counter); // fires `init`
```

Or, via `document.createElement`:

```js
const counter = document.createElement('my-counter'); // does not fire `init`
conuter.count = 10;
document.body.append(counter); // fires `init`
```

### attr(host, key[, value[, options]])

Alias: `defineAttribute`

- `host` `{FunlitElement}` Host element.
- `key` `{string}` Name of the property which will serve as the attribute's accessor.
- `value` `{any}` (default: `null`) Optional initial value of the attribute if one is not provided in markup or imperatively.
- `options` `{object}`
  - `attribute` `{string}` (default: hyphenated `key`) Optionally specify the exact attribute name if you don't like the one autogenerated from the `key`.
  - `boolean` `{boolean}` (default: `false`) Whether the attribute is a boolean.
  - `parse` `{(string) => value}` Optional function to parse the attribute value to the property value.
  - `stringify` `{(value) => string}` Optional function to stringify the property value for rendering.

Returns: `{{ value, toString: () => string }}`

Defines a new property on the host. Any change to the property will trigger an update-render cycle. The property is initialized with and will watch for changes to the related attribute's value. Changes to the property will not be reflected back to the DOM (this is intentional for performance and security). Returns a mutable value ref.

```js
define('my-counter', (host) => {
  const count = attr(host, 'count', 0, { parse: Number });

  function incrementByValue() {
    count.value++;
  }

  function incrementByProperty() {
    host.count++;
  }

  return () => html`
    ${count}
    <button @click=${incrementByValue}>+ value</button>
    <button @click=${incrementByProperty}>+ property</button>
  `;
});
```

You may set the value via markup.

```html
<my-counter count="10"></my-counter>
```

Or, programmatically:

```js
const counter = document.createElement('my-counter');
conuter.count = 10;
document.body.append(counter);
```

### prop(host, key[, value[, options]])

Alias: `defineProperty`

- `host` `{FunlitElement}` Host element.
- `key` `{string}` Name of the property.
- `value` `{any}` (default: `null`) Optional initial value of the property, if one is not provided imperatively.
- `options` `{object}`
  - `stringify` `{(value) => string}` Optional function to stringify the property value for rendering.

Returns: `{{ value, toString: () => string }}`

Defines a new property on the host. Any change to the property will trigger an update-render cycle. Returns a mutable value ref.

```js
define('my-counter', (host) => {
  const count = prop(host, 'count', 0);

  function incrementByValue() {
    count.value++;
  }

  function incrementByProperty() {
    host.count++;
  }

  return () => html`
    ${count}
    <button @click=${incrementByValue}>+ value</button>
    <button @click=${incrementByProperty}>+ property</button>
  `;
});
```

You may set the value programmatically:

```js
const counter = document.createElement('my-counter');
conuter.count = 10;
document.body.append(counter);
```

### val(host, value[, options])

Alias: `defineValue`

- `host` `{FunlitElement}` Host element.
- `value` `{any}` (default: `null`) Optional initial value of the property.
- `options` `{object}`
  - `stringify` `{(value) => string}` Optional function to stringify the value for rendering.

Returns: `{{ value, toString: () => string }}`

Defines a new private value. Any change to the value will trigger an update-render cycle. Returns a mutable value ref.

```js
define('my-counter', (host) => {
  const count = val(host, 0);

  function increment() {
    count.value++;
  }

  return () => html`
    ${count}
    <button @click=${increment}>+</button>
  `;
});
```

## Host

### Lifecycle callbacks

[Native lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks) are emitted as non-bubbling `adopt`, `connect`, and `disconnect` events. There is no `attributechange` event emitted as attribute changes are handled with [`attr()`](#attrhost-key-value-options) and cannot be defined using the `observedAttributes` property.

```js
define('my-element', (host) => {
  host.addEventListener('adopt', () => { /* ... */ });
  host.addEventListener('connect', () => { /* ... */ });
  host.addEventListener('disconnect', () => { /* ... */ });
  host.addEventListener('update', () => { /* ... */ });
});
```

### host.update(), host.updateComplete

The `.update()` method is automatically called any time the element is connected or a defined attribute, property, or value changes, but may also be called directly. Updates are batched so it's safe to trigger any number of updates at a time without causing unnecessary rerenders. Will trigger a non-bubbling `update` event. Returns a promise that resolves after the resulting rerender happens.

The `connect` and `update` event handlers may make use of `host.updateComplete` to run code before or after a render.

```js
define('my-element', (host) => {
  async function refresh() {
    // before render
    await host.update();
    // after render
  }

  host.addEventListener('connect', async () => {
    // before render
    await host.updateCompleted;
    // after render
  });

  host.addEventListener('update', async () => {
    // before render
    await host.updateCompleted;
    // after render
  });

  return () => html`
    ${new Date()}
    <button @click=${refresh}>Refresh</button>
  `;
});
```

## TypeScript

You can define elements using TypeScript, if you're into that sort of thing.

```typescript
import { define, attr, prop, val, html } from 'funlit';

export const FunTypesElement = define<{
  foo: number;
  bar: string;
}>('fun-types', (host) => {
  const foo = attr(host, 'foo', 123, { parse: Number });
  const bar = prop(host, 'bar', 'abc');
  const baz = val(host, true);

  return () => html`
    <div>foo: ${foo}</div>
    <div>bar: ${bar}</div>
    <div>baz: ${baz}</div>
  `;
});

declare global {
  interface HTMLElementTagNameMap {
    'fun-types': InstanceType<typeof FunTypesElement>;
  }
}

const a = new FunTypesElement();

console.log(a.foo);
console.log(a.bar);
console.log(a.update);

const b = document.createElement('fun-types');

console.log(b.foo);
console.log(b.bar);
console.log(b.update);
```

----

MIT © [Shannon Moeller](http://shannonmoeller.com)
