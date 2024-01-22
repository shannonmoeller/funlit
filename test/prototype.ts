type Constructor<T> = { new (): T };
type Renderer = () => object;
type Init<T extends object> = (host: FunLitElement & T) => Renderer;
type ValueRef<T> = { value: T; toString: () => string };

class FunLitElement extends HTMLElement {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	init: Init<any> | null = null;
	isInitialized: boolean = false;
	render: Renderer | null = null;
	updateCompleted: Promise<void> | null = null;

	connectedCallback() {
		this.render = this.init?.(this) ?? null;
	}

	update = () => {
		return (this.updateCompleted ??= Promise.resolve());
	};
}

function define<T extends FunLitElement>(tagName: string, init: Init<T>) {
	class CustomFunLitElement extends FunLitElement {
		init = init;
	}

	customElements.define(tagName, CustomFunLitElement);

	return CustomFunLitElement as Constructor<T>;
}

function attr<T extends FunLitElement, K extends keyof T>(
	host: T,
	key: K,
	value: T[K],
): ValueRef<T[K]> {
	// bind to attribute

	return {
		get value() {
			return value;
		},
		set value(next) {
			value = next;
			host.update();
		},
		toString() {
			return String(value);
		},
	};
}

function prop<T extends FunLitElement, K extends keyof T>(
	host: T,
	key: K,
	value: T[K],
): ValueRef<T[K]> {
	// bind to property

	return {
		get value() {
			return value;
		},
		set value(next) {
			value = next;
			host.update();
		},
		toString() {
			return String(value);
		},
	};
}

function val<V, T extends FunLitElement = FunLitElement>(
	host: T,
	value: V,
): ValueRef<V> {
	return {
		get value() {
			return value;
		},
		set value(next) {
			value = next;
			host.update();
		},
		toString() {
			return String(value);
		},
	};
}

interface FooBarElement extends FunLitElement {
	foo: number;
	bar: string | null;
}

const FooBarElement: Constructor<FooBarElement> = define('foo-bar', (host) => {
	const foo = attr(host, 'foo', 123);
	const bar = prop(host, 'bar', null);
	const baz = val<boolean>(host, true);

	console.log(host.foo);
	console.log(foo.value);
	console.log(host.bar);
	console.log(bar.value);
	console.log(baz.value);

	return () => ({});
});

const a = new FooBarElement();

console.log(a.foo);
console.log(a.bar);

const b = document.createElement('foo-bar') as FooBarElement;

console.log(b.foo);
console.log(b.bar);
