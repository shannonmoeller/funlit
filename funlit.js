/*!
 * @license MIT
 * Copyright (c) 2024 Shannon Moeller
 * https://github.com/shannonmoeller/funlit
 */

import { html, svg, nothing, render } from 'lit-html';

export {
	defineElement as define,
	defineAttribute as attr,
	defineProperty as prop,
	defineValue as val,
	html,
	svg,
	nothing,
};

/**
 * @typedef {import('lit-html').TemplateResult} TemplateResult
 */

/**
 * @template {object} T
 * @typedef {FunlitElement<T> & T} FunlitElementInstance
 */

/**
 * @template {object} T
 * @typedef {{ new(): FunlitElementInstance<T> }} FunlitElementConstructor
 */

/**
 * @typedef {(() => TemplateResult) | null | undefined} Renderer
 */

/**
 * @template {object} T
 * @typedef {(host: FunlitElementInstance<T>) => Renderer} Init
 */

/**
 * @template T
 * @typedef {object} ValueRef
 * @property {T} value
 * @property {() => string} toString
 */

/**
 * @template T
 * @param {unknown} value
 */
function unsafeCast(value) {
	return /** @type {T} */ (value);
}

/**
 * @abstract
 * @template {object} T
 */
export class FunlitElement extends HTMLElement {
	/** @type {Init<T> | null} */
	#init = null;

	/** @type {boolean} */
	#isInitialized = false;

	/** @type {Renderer | null} */
	#render = null;

	/** @type {Promise<void> | null} */
	updateComplete = null;

	/**
	 * @param {Init<T>} init
	 */
	constructor(init) {
		super();
		this.#init = init;
	}

	adoptedCallback() {
		this.dispatchEvent(new CustomEvent('adopt'));
	}

	connectedCallback() {
		if (!this.isConnected) return;

		if (!this.#isInitialized) {
			this.#render = this.#init?.(unsafeCast(this)) ?? null;
			this.#isInitialized = true;
		}

		this.update();
		this.dispatchEvent(new CustomEvent('connect'));
	}

	disconnectedCallback() {
		if (this.isConnected) return;

		this.dispatchEvent(new CustomEvent('disconnect'));
	}

	update = () => {
		return (this.updateComplete ??= Promise.resolve().then(() => {
			this.dispatchEvent(new CustomEvent('update'));
			this.updateComplete = null;
			render(this.#render?.(), this.shadowRoot || this);
		}));
	};
}

/**
 * @template {object} T
 * @param {string} tagName
 * @param {Init<T>} init
 */
export function defineElement(tagName, init) {
	/** @extends {FunlitElement<T>} */
	class CustomFunlitElement extends FunlitElement {
		constructor() {
			super(init);
		}
	}

	Object.defineProperty(CustomFunlitElement, 'name', {
		value: `${pascalify(tagName)}Element`,
	});

	customElements.define(tagName, CustomFunlitElement);

	return /** @type {FunlitElementConstructor<T>} */ (CustomFunlitElement);
}

/**
 * @template {Exclude<keyof T, symbol | number>} K
 * @template {object} T
 * @param {FunlitElementInstance<T>} host
 * @param {K} key
 * @param {T[K]} value
 * @param {object} [options]
 * @param {string} [options.attribute]
 * @param {boolean} [options.boolean]
 * @param {(value: string) => T[K]} [options.parse]
 * @param {(value: T[K]) => string} [options.stringify]
 * @returns {ValueRef<T[K]>}
 */
export function defineAttribute(host, key, value, options = {}) {
	const {
		attribute = hyphenify(key),
		boolean = false,
		parse = String,
	} = options;

	new MutationObserver(() => {
		// @ts-expect-error: This is fine.
		host[key] = boolean
			? host.hasAttribute(attribute)
			: parse(host.getAttribute(attribute) ?? '');
	}).observe(host, {
		attributeFilter: [attribute],
	});

	if (key in host) {
		value = host[key];
	} else if (host.hasAttribute(attribute)) {
		// @ts-expect-error: This is fine.
		value = boolean ? true : parse(host.getAttribute(attribute) ?? '');
	}

	return createProperty(host, key, value, options);
}

/**
 * @template {Exclude<keyof T, symbol | number>} K
 * @template {object} T
 * @param {FunlitElementInstance<T>} host
 * @param {K} key
 * @param {T[K]} value
 * @param {object} [options]
 * @param {(value: T[K]) => string} [options.stringify]
 * @returns {ValueRef<T[K]>}
 */
export function defineProperty(host, key, value, options = {}) {
	if (key in host) {
		value = host[key];
	}

	return createProperty(host, key, value, options);
}

/**
 * @template V
 * @template {object} T
 * @param {FunlitElementInstance<T>} host
 * @param {V} value
 * @param {object} [options]
 * @param {(value: V) => string} [options.stringify]
 * @returns {ValueRef<V>}
 */
export function defineValue(host, value, options = {}) {
	return createValue(host, value, options);
}

/**
 * @template {Exclude<keyof T, symbol | number>} K
 * @template {object} T
 * @param {FunlitElementInstance<T>} host
 * @param {K} key
 * @param {T[K]} value
 * @param {object} [options]
 * @param {(value: T[K]) => string} [options.stringify]
 * @returns {ValueRef<T[K]>}
 */
export function createProperty(host, key, value, options = {}) {
	const ref = createValue(host, value, options);

	Object.defineProperty(host, key, {
		configurable: false,
		enumerable: true,
		get() {
			return ref.value;
		},
		set(next) {
			ref.value = next;
		},
	});

	return ref;
}

/**
 * @template V
 * @template {object} T
 * @param {FunlitElementInstance<T>} host
 * @param {V} value
 * @param {object} [options]
 * @param {(value: V) => string} [options.stringify]
 * @returns {ValueRef<V>}
 */
export function createValue(host, value, options = {}) {
	const { stringify = String } = options;

	return {
		get value() {
			return value;
		},
		set value(next) {
			if (next === value) return;

			value = next;
			host.update();
		},
		toString() {
			return stringify(value);
		},
	};
}

/**
 * @param {string | null | undefined} value
 */
function hyphenify(value) {
	return value?.replace(/[A-Z]/g, (a) => `-${a.toLowerCase()}`) ?? '';
}

/**
 * @param {string | null | undefined} value
 */
function pascalify(value) {
	return value?.replace(/(?:^|-)(\w)/g, (a, b) => b.toUpperCase()) ?? '';
}

/**
 * @type {FunlitElementConstructor<{
 *   foo: number;
 *   bar: string | null
 * }>}
 */
const FooBarElement = defineElement('foo-bar', (host) => {
	const foo = defineAttribute(host, 'foo', 123);
	const bar = defineProperty(host, 'bar', null);
	const baz = defineValue(host, true);

	console.log(host.foo);
	console.log(foo.value);
	console.log(host.bar);
	console.log(bar.value);
	console.log(baz.value);

	return () => html``;
});

const a = new FooBarElement();

console.log(a.foo);
console.log(a.bar);
console.log(a.update);

const b = /** @type {InstanceType<typeof FooBarElement>} */ (
	document.createElement('foo-bar')
);

console.log(b.foo);
console.log(b.bar);
console.log(b.update);
