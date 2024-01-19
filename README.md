# funlit

Function Lit elements. Light DOM by default.

```js
import { define, attr, html } from 'funlit';

define('my-stepper', () => {
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
