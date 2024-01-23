import { define, attr, prop, val, html } from '../funlit.js';

/**
 * @param {import('../funlit.js').FunlitElementInstance<{
 *   foo: number;
 *   bar: string | null;
 * }>} host
 */
function FunTypes(host) {
	const foo = attr(host, 'foo', 123, { parse: Number });
	const bar = prop(host, 'bar', 'abc');
	const baz = val(host, true);

	console.log(host.foo, foo.value, host.foo === foo.value);
	console.log(host.bar, bar.value, host.bar === bar.value);

	host.addEventListener('adopt', console.log);
	host.addEventListener('connect', console.log);
	host.addEventListener('update', console.log);
	host.addEventListener('disconnect', console.log);

	return () => html`
		<div>foo: ${foo}</div>
		<div>bar: ${bar}</div>
		<div>baz: ${baz}</div>
	`;
}

export const FunTypesElement = define('fun-types', FunTypes);

const a = new FunTypesElement();

console.log(a.foo);
console.log(a.bar);
console.log(a.update);

const b = document.createElement('fun-types');

console.log(b.foo);
console.log(b.bar);
console.log(b.update);

///////////////////////////////////////////////////////////////////////////////

/**
 * @type {import('../funlit.js').FunlitElementConstructor<{
 *   foo: number;
 *   bar: string | null;
 * }>}
 */
export const FunTypesTwoElement = define('fun-types-two', (host) => {
	const foo = attr(host, 'foo', 123, { parse: Number });
	const bar = prop(host, 'bar', 'abc');
	const baz = val(host, true);

	console.log(host.foo, foo.value, host.foo === foo.value);
	console.log(host.bar, bar.value, host.bar === bar.value);

	host.addEventListener('adopt', console.log);
	host.addEventListener('connect', console.log);
	host.addEventListener('update', console.log);
	host.addEventListener('disconnect', console.log);

	return () => html`
		<div>foo: ${foo}</div>
		<div>bar: ${bar}</div>
		<div>baz: ${baz}</div>
	`;
});

const c = new FunTypesTwoElement();

console.log(c.foo);
console.log(c.bar);
console.log(c.update);

const d = document.createElement('fun-types-two');

console.log(d.foo);
console.log(d.bar);
console.log(d.update);
