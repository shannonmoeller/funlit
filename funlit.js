import { html, render } from 'lit-html';

export {
	defineElement as define,
	defineAttribute as attr,
	defineProperty as prop,
	defineValue as val,
	html,
};

/**
 * @callback Renderer
 * @returns {import('lit-html').TemplateResult}
 */

/**
 * @callback Init
 * @param {FunlitElement} host
 * @returns {Renderer | null | undefined}
 */

/**
 * @typedef Updateable
 * @prop {() => void} update
 */

/**
 * @template V
 * @typedef {object} ValueRef
 * @prop {V} value
 * @prop {() => string} toString
 */

/** @type {(HTMLElement & Updateable) | null} */
let currentHost = null;

export class FunlitElement extends HTMLElement {
	/** @type {Init | null} */
	init = null;

	/** @type {boolean} */
	#isInitialized = false;

	/** @type {Renderer | null | undefined} */
	#render = null;

	/** @type {Promise<void> | null} */
	updateComplete = null;

	adoptedCallback() {
		this.dispatchEvent(new CustomEvent('adopt'));
	}

	connectedCallback() {
		if (!this.isConnected) return;

		if (!this.#isInitialized) {
			const unsetHost = setHost(this);

			this.#render = this.init?.(this);
			this.#isInitialized = true;

			unsetHost();
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
			this.updateComplete = null;
			render(this.#render?.(), this);
			this.dispatchEvent(new CustomEvent('update'));
		}));
	};
}

/**
 * @param {string} tag
 * @param {Init} init
 */
export function defineElement(tag, init) {
	class CustomFunlitElement extends FunlitElement {
		init = init;
	}

	Object.defineProperty(CustomFunlitElement, 'name', {
		value: `${pascalify(tag)}Element`,
	});

	customElements.define(tag, CustomFunlitElement);

	return CustomFunlitElement;
}

/**
 * @template V
 * @template {string} K
 * @param {K} key
 * @param {V} value
 * @param {object} [options]
 * @param {string} [options.attribute]
 * @param {boolean} [options.boolean]
 * @param {HTMLElement & Updateable} [options.host]
 * @param {(value: string) => V} [options.parse]
 * @param {(value: V) => string} [options.stringify]
 * @returns {ValueRef<V>}
 */
export function defineAttribute(key, value, options = {}) {
	const {
		attribute = hyphenify(key),
		boolean = false,
		host = getHost(),
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
		// @ts-expect-error: This is fine.
		value = host[key];
	} else if (host.hasAttribute(attribute)) {
		// @ts-expect-error: This is fine.
		value = boolean ? true : parse(host.getAttribute(attribute) ?? '');
	}

	return createProperty(key, value, options);
}

/**
 * @template V
 * @template {string} K
 * @param {K} key
 * @param {V} value
 * @param {object} [options]
 * @param {Updateable} [options.host]
 * @param {(value: V) => string} [options.stringify]
 * @returns {ValueRef<V>}
 */
export function defineProperty(key, value, options = {}) {
	const { host = getHost() } = options;

	if (key in host) {
		// @ts-expect-error: This is fine.
		value = host[key];
	}

	return createProperty(key, value, options);
}

/**
 * @template V
 * @param {V} value
 * @param {object} [options]
 * @param {Updateable} [options.host]
 * @param {(value: V) => string} [options.stringify]
 * @returns {ValueRef<V>}
 */
export function defineValue(value, options = {}) {
	return createValue(value, options);
}

/**
 * @template V
 * @template {string} K
 * @param {K} key
 * @param {V} value
 * @param {object} [options]
 * @param {Updateable} [options.host]
 * @param {(value: V) => string} [options.stringify]
 * @returns {ValueRef<V>}
 */
function createProperty(key, value, options = {}) {
	const { host = getHost() } = options;
	const ref = createValue(value, options);

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
 * @param {V} value
 * @param {object} [options]
 * @param {Updateable} [options.host]
 * @param {(value: V) => string} [options.stringify]
 * @returns {ValueRef<V>}
 */
function createValue(value, options = {}) {
	const { host = getHost(), stringify = String } = options;

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

export function getHost() {
	if (!currentHost) throw new Error('Missing host.');

	return currentHost;
}

/**
 * @param {HTMLElement & Updateable} host
 */
export function setHost(host) {
	if (currentHost) throw new Error('Host already exists');

	currentHost = host;

	return () => {
		currentHost = null;
	};
}

/**
 * @param {string} value
 */
function hyphenify(value) {
	return value.replace(/[A-Z]/g, (a) => `-${a.toLowerCase()}`);
}

/**
 * @param {string} value
 */
function pascalify(value) {
	return value.replace(/(?:^|-)(\w)/g, (a, b) => b.toUpperCase());
}
