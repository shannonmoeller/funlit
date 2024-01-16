import { html, render } from "lit-html";

export {
  defineElement as define,
  defineAttribute as attr,
  defineProperty as prop,
  defineValue as val,
  html,
};

export class FunlitElement extends HTMLElement {
  #init = null;
  #isInitialized = false;
  #render = null;
  updateComplete = null;

  constructor(init) {
    super();
    this.#init = init;
  }

  adoptedCallback() {
    this.dispatchEvent(new CustomEvent("adopt"));
  }

  connectedCallback() {
    if (!this.isConnected) return;

    if (!this.#isInitialized) {
      this.#render = this.#init(this);
      this.#isInitialized = true;
    }

    this.update();
    this.dispatchEvent(new CustomEvent("connect"));
  }

  disconnectedCallback() {
    if (this.isConnected) return;

    this.dispatchEvent(new CustomEvent("disconnect"));
  }

  update = () => {
    return (this.updateComplete ??= Promise
      // batch updates
      .resolve()
      .then(() => {
        render(this.#render?.(), this);
      })
      .finally(() => {
        this.updateComplete = null;
        this.dispatchEvent(new CustomEvent("update"));
      }));
  };
}

export function defineElement(name, init) {
  class FunlitComponent extends FunlitElement {
    constructor() {
      super(init);
    }
  }

  Object.defineProperty(FunlitComponent, "name", {
    value: `${pascalify(name)}Element`,
  });

  customElements.define(name, FunlitComponent);

  return FunlitComponent;
}

export function defineAttribute(host, name, value, options = {}) {
  const {
    attribute = hyphenify(name),
    boolean = false,
    parse = String,
    stringify = String,
  } = options;

  if (name in host) {
    value = host[name];
  } else if (host.hasAttribute(attribute)) {
    value = boolean ? true : parse(host.getAttribute(attribute));
  }

  const state = defineValue(host, value, { stringify });

  Object.defineProperty(host, name, {
    configurable: false,
    enumerable: true,
    get() {
      return state.value;
    },
    set(next) {
      state.value = next;
    },
  });

  new MutationObserver(() => {
    host[name] = boolean
      ? host.hasAttribute(attribute)
      : parse(host.getAttribute(attribute));
  }).observe(host, {
    attributeFilter: [attribute],
  });

  return state;
}

export function defineProperty(host, name, value, options = {}) {
  const { stringify = String } = options;

  if (name in host) {
    value = host[name];
  }

  const state = defineValue(host, value, { stringify });

  Object.defineProperty(host, name, {
    configurable: false,
    enumerable: true,
    get() {
      return state.value;
    },
    set(next) {
      state.value = next;
    },
  });

  return state;
}

export function defineValue(host, value, options = {}) {
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

function hyphenify(string) {
  return string.replace(/[A-Z]/g, (a) => `-${a.toLowerCase()}`);
}

function pascalify(string) {
  return string.replace(/(?:^|-)(\w)/g, (a, b) => b.toUpperCase());
}
