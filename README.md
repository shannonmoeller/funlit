# Funlit

Functional Lit elements.

```js
import { define, attr, html } from 'funlit';

define('fun-stepper', (host) => {
  const count = attr(host, 'count', 0, {
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
