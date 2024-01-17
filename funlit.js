import { html, render } from "lit-html";

export {
  defineElement as define,
  defineAttribute as attr,
  defineProperty as prop,
  defineValue as val,
  html,
};

let currentHost = null;

export class FunlitElement extends HTMLElement {
  #init = null;
  #isInitialized = false;
  #render = null;
  updateComplete = null;

  constructor(init) {
    super();

    this.#init = init;
    this.update = this.update.bind(this);
  }

  adoptedCallback() {
    emit(this, "adopt");
  }

  connectedCallback() {
    if (!this.isConnected) return;

    if (!this.#isInitialized) {
      currentHost = this;
      this.#render = this.#init(this);
      this.#isInitialized = true;
      currentHost = null;
    }

    this.update();
    emit(this, "connect");
  }

  disconnectedCallback() {
    if (this.isConnected) return;

    emit(this, "disconnect");
  }

  update() {
    return (this.updateComplete ??= Promise.resolve().then(() => {
      this.updateComplete = null;
      render(this.#render?.(), this);
      emit(this, "update");
    }));
  }
}

export function defineElement(name, init) {
  class DefinedFunlitElement extends FunlitElement {
    constructor() {
      super(init);
    }
  }

  Object.defineProperty(DefinedFunlitElement, "name", {
    value: `${pascalify(name)}Element`,
  });

  customElements.define(name, DefinedFunlitElement);

  return DefinedFunlitElement;
}

export function defineAttribute(name, value, options = {}) {
  const host = getHost();
  const {
    attribute = hyphenify(name),
    boolean = false,
    parse = String,
    stringify = String,
  } = options;

  new MutationObserver(() => {
    host[name] = boolean
      ? host.hasAttribute(attribute)
      : parse(host.getAttribute(attribute));
  }).observe(host, {
    attributeFilter: [attribute],
  });

  if (name in host) {
    value = host[name];
  } else if (host.hasAttribute(attribute)) {
    value = boolean ? true : parse(host.getAttribute(attribute));
  }

  return createProperty(host, name, value, options);
}

export function defineProperty(name, value, options = {}) {
  const host = getHost();

  if (name in host) {
    value = host[name];
  }

  return createProperty(host, name, value, options);
}

export function defineValue(value, options = {}) {
  const host = getHost();

  return createValue(host, value, options);
}

export function getHost() {
  const host = currentHost;

  if (!host) throw new Error("Missing host.");

  return host;
}

function createProperty(host, name, value, options = {}) {
  const ref = createValue(host, value, options);

  Object.defineProperty(host, name, {
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

function createValue(host, value, options = {}) {
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

function emit(host, type, detail = null) {
  return host.dispatchEvent(new CustomEvent(type, { detail }));
}

function hyphenify(string) {
  return string.replace(/[A-Z]/g, (a) => `-${a.toLowerCase()}`);
}

function pascalify(string) {
  return string.replace(/(?:^|-)(\w)/g, (a, b) => b.toUpperCase());
}
