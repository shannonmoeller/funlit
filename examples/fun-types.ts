import { define, attr, prop, val, html } from '../funlit.js';

export const TestTypesElement = define<{
	foo: number;
	bar: string | null;
}>('test-types', (host) => {
	const foo = attr(host, 'foo', 100, { parse: Number });
	const bar = prop(host, 'bar', 'hello');
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

const a = new TestTypesElement();

console.log(a.update);
console.log(a.foo);
console.log(a.bar);

const b = document.createElement('test-types') as InstanceType<
	typeof TestTypesElement
>;

console.log(b.update);
console.log(b.foo);
console.log(b.bar);
