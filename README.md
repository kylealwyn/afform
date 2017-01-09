# Afform.js

Plug and play automatic form validation using HTML5 builtin methods.

### Initializing
Create a new instance using `new Afform(form, [options])`

- `form` - A string selector or DOM Node
- `[options]` - Optional instance-specific configuration options. See setConfig below.

### Public Interface
- `scanAndInit`
  - Looks for forms with the `afform` data attribute and initializes `new Afform` instances on each.


- `setConfig` - Sets global configuration. Available options and defaults below.
  - `FormDataAttribute`: 'data-afform',
  - `ValidationsAttribute`: 'data-validations',
  - `FormGroupClass`: 'form-group',
  - `ErrorElementClass`: 'afform-error',
  - `ErrorModifierClass`: 'has-error',
  - `DefaultMessages`
      - `badInput`: 'This field is incorrect.',
      - `patternMismatch`: 'This pattern is incorrect',
      - `rangeOverflow`: 'This field is too large',
      - `rangeUnderflow`: 'This field is too small',
      - `stepMismatch`: 'This field is out of step',
      - `tooLong`: 'This field is too long',
      - `tooShort`: 'This field is too short',
      - `typeMismatch`: 'This field has an incorrect type',
      - `valueMissing`: 'This field is required'
