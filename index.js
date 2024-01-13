import { html, render } from "lit-html";

export { html };

function hyphenCase(string) {
  return string.replace(/[A-Z]/g, (a) => `-${a.toLowerCase()}`);
}

function pascalCase(string) {
  return string.replace(/(?:^|-)(\w)/g, (a, b) => b.toUpperCase());
}

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

export function define(name, init) {
  class CustomElement extends FunlitElement {
    constructor() {
      super(init);
    }
  }

  Object.defineProperty(CustomElement, "name", {
    value: `${pascalCase(name)}Element`,
  });

  customElements.define(name, CustomElement);

  return CustomElement;
}

export function attr(host, name, value, options = {}) {
  let {
    attr = hyphenCase(name),
    boolean = false,
    parse = String,
    stringify = String,
  } = options;

  Object.defineProperty(host, name, {
    get() {
      return value;
    },
    set(next) {
      if (next === value) return;
      value = next;
      host.update();
    },
  });

  function readAttribute() {
    host[name] = boolean
      ? host.hasAttribute(attr)
      : parse(host.getAttribute(attr));
  }

  new MutationObserver(() => {
    readAttribute();
    host.update();
  }).observe(host, {
    attributeFilter: [attr],
  });

  if (boolean || host.hasAttribute(attr)) {
    readAttribute();
  }

  return {
    get value() {
      return host[name];
    },
    set value(next) {
      host[name] = next;
    },
    toString() {
      return stringify(host[name]);
    },
  };
}

export function prop(host, name, value) {
  Object.defineProperty(host, name, {
    get() {
      return value;
    },
    set(next) {
      if (next === value) return;
      value = next;
      host.update();
    },
  });

  return {
    get value() {
      return host[name];
    },
    set value(next) {
      host[name] = next;
    },
    toString() {
      return String(host[name]);
    },
  };
}

export function state(host, value) {
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
      return String(value);
    },
  };
}
