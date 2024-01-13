# Funlit

Functional Lit elements. Light DOM by default.

```js
import { define, attribute, html } from 'funlit';

define('fun-stepper', (host) => {
  const count = attribute(host, 'count', 0, {
    parse: Number,
  });

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
```

```html
<fun-stepper></fun-stepper>
<fun-stepper count="10"></fun-stepper>
```
