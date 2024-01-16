# funlit

Function Lit elements. Light DOM by default.

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
<script>
  const stepper = document.createElement('fun-stepper');
  stepper.count = 20;
  document.body.append(stepper);
</script>
```
