'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
  var global = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  /**
   * Object.assign polyfill
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
   */
  if (typeof Object.assign !== 'function') {
    Object.assign = function (target, varArgs) {
      // .length of function is 2
      'use strict';

      if (target == null) {
        // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          // Skip over if undefined or null
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
    Array.isArray = function (arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }

  /**
   * Element.closest polyfill
   * https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
   */
  if (global.Element && !Element.prototype.closest) {
    Element.prototype.closest = function (s) {
      var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i,
          el = this;
      do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el) {};
      } while (i < 0 && (el = el.parentElement));
      return el;
    };
  }

  /**
   * Simple is object check.
   * @param item
   * @returns {boolean}
   */
  function isObject(item) {
    return item && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object' && !Array.isArray(item);
  }

  /**
   * Deep merge two objects.
   * @param target
   * @param source
   */
  function mergeDeep(target) {
    if (isObject(target)) {
      for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        sources[_key - 1] = arguments[_key];
      }

      sources.forEach(function (source) {
        if (isObject(source)) {
          for (var key in source) {
            if (isObject(source[key])) {
              if (!target[key]) Object.assign(target, _defineProperty({}, key, {}));
              mergeDeep(target[key], source[key]);
            } else {
              Object.assign(target, _defineProperty({}, key, source[key]));
            }
          }
        }
      });
    }

    return target;
  }

  var DefaultConfig = {
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
    onValid: function onValid() {},
    onError: function onError() {}
  };

  var Afform = function () {
    function Afform(form) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Afform);

      this.form = form;
      this.form.setAttribute('novalidate', 'novalidate');
      this.formFields = [].slice.call(this.form.elements);
      this.config = mergeDeep({}, Afform.config, options);

      this.subscribe();
    }

    _createClass(Afform, [{
      key: 'subscribe',
      value: function subscribe() {
        var _this = this;

        this.form.addEventListener('submit', this.onSubmit.bind(this));
        this.formFields.forEach(function (formField) {
          formField.addEventListener('blur', _this.validateFormField.bind(_this, formField));
        });
      }
    }, {
      key: 'appendError',
      value: function appendError(formField, message) {
        var formGroup = formField.closest('.' + this.config.FormGroupClass);

        if (!formGroup.classList.contains(this.config.ErrorModifierClass)) {
          var errorMessage = document.createElement('span');
          errorMessage.classList.add(this.config.ErrorElementClass);
          errorMessage.innerHTML = message;

          formGroup.classList.add(this.config.ErrorModifierClass);
          formGroup.appendChild(errorMessage);
        }
      }
    }, {
      key: 'onSubmit',
      value: function onSubmit(event) {
        this.resetForm();

        if (this.form.checkValidity()) {
          return true;
        }

        event.preventDefault();

        this.formFields.forEach(this.validateFormField.bind(this));
      }
    }, {
      key: 'validateFormField',
      value: function validateFormField(formField) {
        var validity = formField.validity;


        this.resetFormField(formField);

        if (validity.valid) {
          this.config.onValid(formField);
          return;
        }

        var customMessages = formField.getAttribute(this.config.ValidationsAttribute);

        // merge default and overridden messages
        var messages = mergeDeep({}, this.config.DefaultMessages, JSON.parse(customMessages));

        for (var type in validity) {
          if (validity[type]) {
            this.config.onError(formField);
            this.appendError(formField, messages[type]);
          }
        }
      }
    }, {
      key: 'resetForm',
      value: function resetForm() {
        this.formFields.forEach(this.resetFormField.bind(this));
      }
    }, {
      key: 'resetFormField',
      value: function resetFormField(formField) {
        var formGroup = formField.closest('.' + this.config.FormGroupClass);
        try {
          formGroup.classList.remove(this.config.ErrorModifierClass);
          formGroup.querySelector('.' + this.config.ErrorElementClass).remove();
        } catch (e) {
          // formGroup most likely didn't have error block
        }
      }
    }], [{
      key: 'setConfig',
      value: function setConfig(config) {
        Afform.config = mergeDeep({}, DefaultConfig, config);
      }
    }, {
      key: 'scanAndInit',
      value: function scanAndInit() {
        var formNodes = document.querySelectorAll('[' + Afform.config.FormDataAttribute + ']');
        [].slice.call(formNodes).forEach(function (f) {
          return new Afform(f);
        });
      }
    }]);

    return Afform;
  }();

  Afform.config = DefaultConfig;

  if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
    module.exports = Afform;
  } else {
    global.Afform = Afform;
  }

  document.addEventListener("DOMContentLoaded", function () {
    Afform.scanAndInit();
  });
})(window);
