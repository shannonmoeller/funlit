# funlit

Function Lit elements. Light DOM by default.

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

### lit-html

Reexports `html`, `svg`, and `nothing` from `lit-html`. Anything else you need (such as directives) should be imported from `lit-html` directly.

### define(tag, init)

Alias: `defineElement`

### attr(key, value[, options])

Alias: `defineAttribute`

### prop(key, value[, options])

Alias: `defineProperty`

### val(value[, options])

Alias: `defineValue`
