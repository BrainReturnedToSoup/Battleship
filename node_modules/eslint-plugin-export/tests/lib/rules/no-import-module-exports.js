/**
 * @fileoverview Should not use module.exports or export.xxx when there are import sentences
 * @author Yudu Ban
 * @see https://github.com/benmosher/eslint-plugin-import/issues/760
 * Some code copied from https://github.com/benmosher/eslint-plugin-import/issues/760
 */
'use strict'

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

var rule = require('../../../lib/rules/no-import-module-exports')

var RuleTester = require('eslint').RuleTester

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const parserOptions = { ecmaVersion: 6, sourceType: 'module' }
const error = {
  message: 'Cannot use exports or module.exports in modules that import using ES Module',
  type: 'MemberExpression'
}

const ruleTester = new RuleTester()
ruleTester.run('no-import-module-exports', rule, {
  valid: [
    {
      code: `
        const thing = require('thing')
        module.exports = thing
      `,
      parserOptions
    },
    {
      code: `
        import thing from 'otherthing'
        console.log(thing.module.exports)
      `,
      parserOptions
    },
    {
      code: `
        import thing from 'other-thing'
        export default thing
      `,
      parserOptions
    }
  ],
  invalid: [
    {
      code: `
        import { stuff } from 'starwars'
        module.exports = thing
      `,
      errors: [error],
      parserOptions
    },
    {
      code: `
        import thing from 'starwars'
        const baz = module.exports = thing
        console.log(baz)
      `,
      errors: [error],
      parserOptions
    },
    {
      code: `
        import * as allThings from 'starwars'
        exports.bar = thing
      `,
      errors: [error],
      parserOptions
    },
    {
      code: `
        exports.bar = thing
        import * as allThings from 'starwars'
      `,
      errors: [error],
      parserOptions
    }
  ]
})
