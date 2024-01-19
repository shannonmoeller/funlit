import { define, attr, html } from 'funlit';

define('fun-stepper', () => {
	const count = attr('count', 20, { parse: Number });

	function decrement() {
		count.value--;
	}

	function increment() {
		count.value++;
	}

	function reset() {
		count.value = 0;
	}

	return () => html`
		${count}
		<button @click=${decrement}>-</button>
		<button @click=${increment}>+</button>
		<button @click=${reset}>x</button>
	`;
});
