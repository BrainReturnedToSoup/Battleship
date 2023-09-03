# Should not use module.exports or export.xxx when there are import sentences (no-import-module-exports)

Please describe the origin of the rule here.


## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```js
import { stuff } from 'starwars'
module.exports = thing
```

```js
import * as allThings from 'starwars'
exports.bar = thin
```

Examples of **correct** code for this rule:

```js
const thing = require('thing')
module.exports = thing
```

```js
import thing from 'other-thing'
export default thin
```

### Options

No options.

## When Not To Use It

When you are using babel plugins who supports mix usage of module.exports and import.

## Further Reading

If there are other links that describe the issue this rule addresses, please include them here in a bulleted list.

[eslint plugin import issue](https://github.com/benmosher/eslint-plugin-import/issues/760)