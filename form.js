import { FunlitElement, unsafeCast } from './funlit.js';

export { defineFormElement as formDefine, createFormElement as formElement };

/**
 * @typedef {object} FormField
 * @property {string | File | FormData | undefined} value
 */

/**
 * @template {FormField} T
 * @typedef {FunlitFormElement<T> & T} FunlitFormElementInstance
 */

/**
 * @template {FormField} T
 * @typedef {{ new(): FunlitFormElementInstance<T> }} FunlitFormElementConstructor
 */

/**
 * @abstract
 * @template {FormField} T
 * @extends {FunlitElement<T>}
 */
export class FunlitFormElement extends FunlitElement {
  static formAssociated = true;

  /**
   * @param {HTMLFormElement} form
   */
  formAssociatedCallback(form) {
    this.dispatchEvent(
      new CustomEvent('formassociate', {
        detail: { form },
      }),
    );
  }

  formResetCallback() {
    this.dispatchEvent(new CustomEvent('formreset'));
  }

  /**
   * @param {boolean} disabled
   */
  formDisabledCallback(disabled) {
    if (disabled) {
      this.dispatchEvent(new CustomEvent('formdisable'));
    } else {
      this.dispatchEvent(new CustomEvent('formenable'));
    }
  }

  /**
   * @param {T['value']} state
   * @param {string} reason
   */
  formStateRestoreCallback(state, reason) {
    this.dispatchEvent(
      new CustomEvent('formstaterestore', {
        detail: { state, reason },
      }),
    );
  }
}

/**
 * @template {FormField} T
 * @param {string} tagName
 * @param {import('./funlit.js').Init<T>} init
 */
export function defineFormElement(tagName, init) {
  const CustomFunlitFormElement = createFormElement(init);

  Object.defineProperty(CustomFunlitFormElement, 'name', {
    value: tagName,
  });

  customElements.define(tagName, CustomFunlitFormElement);

  return CustomFunlitFormElement;
}

/**
 * @template {FormField} T
 * @param {import('./funlit.js').Init<T>} init
 * @returns {FunlitFormElementConstructor<T>}
 */
export function createFormElement(init) {
  /** @extends {FunlitFormElement<T>} */
  class CustomFunlitFormElement extends FunlitFormElement {
    constructor() {
      super(init);
    }
  }

  return unsafeCast(CustomFunlitFormElement);
}
