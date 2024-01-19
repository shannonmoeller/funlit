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

### attr(key, value[, options])

Alias: `defineAttribute`

### prop(key, value[, options])

Alias: `defineProperty`

### val(value[, options])

Alias: `defineValue`

----

MIT © [Shannon Moeller](http://shannonmoeller.com)
