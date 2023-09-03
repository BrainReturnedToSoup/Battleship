/**
 * @fileoverview Should not use module.exports or export.xxx when there are import sentences
 * @author Yudu Ban
 * @see https://github.com/benmosher/eslint-plugin-import/issues/760
 * Some code copied from https://github.com/benmosher/eslint-plugin-import/issues/760
 */
'use strict'

// ------------------------------------------------------------------------------
// Rule Definition
// ------------------------------------------------------------------------------

module.exports = {
  meta: {
    docs: {
      description: 'Disallow  module.exports with import statements',
      category: 'Best Practices',
      recommended: true
    },
    fixable: 'code',
    schema: []
  },

  create: function (context) {
    // variables should be defined here
    const importDeclarations = []
    const exportsExpressions = []
    let reported = false
    // ----------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------

    function report (node) {
      context.report({
        node,
        message: 'Cannot use exports or module.exports in modules that import using ES Module'
      })
    }

    // ----------------------------------------------------------------------
    // Public
    // ----------------------------------------------------------------------

    return {
      ImportDeclaration (node) {
        importDeclarations.push(node)
        if (!reported) {
          reported = true
          exportsExpressions.forEach(node => report(node))
        }
      },
      MemberExpression (node) {
        if (isModuleExports(node)) {
          exportsExpressions.push(node)
          if (importDeclarations.length) {
            report(node)
          }
        }

        function isModuleExports (n) {
          return n.object.type === 'Identifier' && (/^(module|exports)$/).test(n.object.name)
        }
      }
    }
  }
}
