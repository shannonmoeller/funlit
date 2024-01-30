/*!
 * @license MIT
 * Copyright (c) 2024 Shannon Moeller
 * https://github.com/shannonmoeller/funlit
 */

import { html, svg, nothing, render } from 'lit-html';

export {
  html,
  svg,
  nothing,
  defineElement as define,
  defineAttribute as attr,
  defineProperty as prop,
  defineValue as val,
  createElement as element,
};

/**
 * @typedef {import('lit-html').TemplateResult} TemplateResult
 */

/**
 * @typedef {null | undefined | void} Nil
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
 * @typedef {() => TemplateResult | Nil} Renderer
 */

/**
 * @template {object} T
 * @typedef {(host: FunlitElementInstance<T>) => Renderer | Nil} Init
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
export function unsafeCast(value) {
  return /** @type {T} */ (value);
}

const refCache = new WeakMap();

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
      refCache.set(this, new Map());

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

      const result = this.#render?.();

      if (result !== undefined) {
        render(result, this.shadowRoot || this);
      }
    }));
  };
}

/**
 * @template {object} T
 * @param {string} tagName
 * @param {Init<T>} init
 */
export function defineElement(tagName, init) {
  const CustomFunlitElement = createElement(init);

  Object.defineProperty(CustomFunlitElement, 'name', {
    value: tagName,
  });

  customElements.define(tagName, CustomFunlitElement);

  return CustomFunlitElement;
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
  if (refCache.get(host).has(key)) {
    return refCache.get(host).get(key);
  }

  const {
    attribute = hyphenify(key),
    boolean = false,
    parse = String,
  } = options;

  new MutationObserver(() => {
    host[key] = unsafeCast(
      boolean
        ? host.hasAttribute(attribute)
        : parse(host.getAttribute(attribute) ?? ''),
    );
  }).observe(host, {
    attributeFilter: [attribute],
  });

  if (key in host) {
    value = host[key];
  } else if (host.hasAttribute(attribute)) {
    value = unsafeCast(
      boolean ? true : parse(host.getAttribute(attribute) ?? ''),
    );
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
  if (refCache.get(host).has(key)) {
    return refCache.get(host).get(key);
  }

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
 * @template {object} T
 * @param {Init<T>} init
 * @returns {FunlitElementConstructor<T>}
 */
export function createElement(init) {
  /** @extends {FunlitElement<T>} */
  class CustomFunlitElement extends FunlitElement {
    constructor() {
      super(init);
    }
  }

  return unsafeCast(CustomFunlitElement);
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
  if (refCache.get(host).has(key)) {
    return refCache.get(host).get(key);
  }

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

  refCache.get(host).set(key, ref);

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
