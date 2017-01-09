((global = {}) => {
  /**
   * Object.assign polyfill
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
   */
  if (typeof Object.assign !== 'function') {
    Object.assign = function (target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    };
  }

  /**
   * Array.isArray polyfill
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
   */
  if (!Array.isArray) {
    Array.isArray = (arg) => Object.prototype.toString.call(arg) === '[object Array]';
  }

  /**
   * Element.closest polyfill
   * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
   */
  if (global.Element && !Element.prototype.closest) {
    Element.prototype.closest =
    function(s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i,
          el = this;
      do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {};
      } while ((i < 0) && (el = el.parentElement));
      return el;
    };
  }

  /**
   * Simple is object check.
   * @param item
   * @returns {boolean}
   */
  function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Deep merge two objects.
   * @param target
   * @param source
   */
  function mergeDeep(target, ...sources) {
    if (isObject(target)) {
      sources.forEach(source => {
        if (isObject(source)) {
          for (const key in source) {
            if (isObject(source[key])) {
              if (!target[key]) Object.assign(target, { [key]: {} });
              mergeDeep(target[key], source[key]);
            } else {
              Object.assign(target, { [key]: source[key] });
            }
          }
        }
      });
    }

    return target;
  }

  const DefaultConfig = {
    FormDataAttribute: 'data-afform',
    ValidationsAttribute: 'data-validations',
    FormGroupClass: 'form-group',
    ErrorElementClass: 'afform-error',
    ErrorModifierClass: 'has-error',
    DefaultMessages: {
      badInput: 'This field is incorrect.',
      patternMismatch: 'This pattern is incorrect',
      rangeOverflow: 'This field is too large',
      rangeUnderflow: 'This field is too small',
      stepMismatch: 'This field is out of step',
      tooLong: 'This field is too long',
      tooShort: 'This field is too short',
      typeMismatch: 'This field has an incorrect type',
      valueMissing: 'This field is required'
    },
    onValid() {},
    onError() {}
  };

  class Afform {
    constructor(form, options = {}) {
      if (typeof form === 'string') {
        this.form = document.querySelector(form);
      } else if (form instanceof Element) {
        this.form = form;
      }

      if (!form) {
        throw new Error('Form not found. First argument must be a selector or DOM Node.')
      }

      this.form = form;
      this.form.setAttribute('novalidate', 'novalidate');
      this.formFields = [].slice.call(this.form.elements);
      this.config = mergeDeep({}, Afform.config, options);

      this.subscribe();
    }

    static setConfig(config) {
      Afform.config = mergeDeep({}, DefaultConfig, config);
    }

    static scanAndInit() {
      const formNodes = document.querySelectorAll(`[${Afform.config.FormDataAttribute}]`);
      [].slice.call(formNodes).forEach(f => new Afform(f));
    }

    subscribe() {
      this.form.addEventListener('submit', this.onSubmit.bind(this));
      this.formFields.forEach((formField) => {
        formField.addEventListener('blur', this.validateFormField.bind(this, formField))
      })
    }

    appendError(formField, message) {
      const formGroup = formField.closest(`.${this.config.FormGroupClass}`);

      if (!formGroup.classList.contains(this.config.ErrorModifierClass)){
        const errorMessage = document.createElement('span');
        errorMessage.classList.add(this.config.ErrorElementClass);
        errorMessage.innerHTML = message;

        formGroup.classList.add(this.config.ErrorModifierClass);
        formGroup.appendChild(errorMessage);
      }
    }

    onSubmit(event) {
      this.resetForm();

      if (this.form.checkValidity())  {
        return true;
      }

      event.preventDefault();

      this.formFields.forEach(this.validateFormField.bind(this))
    }

    validateFormField(formField) {
      const { validity } = formField;

      this.resetFormField(formField);

      if (validity.valid) {
        this.config.onValid(formField);
        return;
      }

      let customMessages = formField.getAttribute(this.config.ValidationsAttribute)

      // merge default and overridden messages
      const messages = mergeDeep({}, this.config.DefaultMessages, JSON.parse(customMessages));

      for (const type in validity) {
        if (validity[type]) {
          this.config.onError(formField);
          this.appendError(formField, messages[type]);
        }
      }
    }

    resetForm() {
      this.formFields.forEach(this.resetFormField.bind(this));
    }

    resetFormField(formField) {
      const formGroup = formField.closest(`.${this.config.FormGroupClass}`);
      try {
        formGroup.classList.remove(this.config.ErrorModifierClass);
        formGroup.querySelector(`.${this.config.ErrorElementClass}`).remove();
      } catch(e) {
        // formGroup most likely didn't have error block
      }
    }
  }

  Afform.config = DefaultConfig;

  if (typeof module === 'object' && module.exports) {
    module.exports = Afform;
  } else {
    global.Afform = Afform;
  }

  document.addEventListener("DOMContentLoaded", () => { Afform.scanAndInit(); });
})(window);
