# eslint-plugin-export

ESLint plugin for exports

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-export`:

```
$ npm install eslint-plugin-export --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-export` globally.

## Usage

Add `export` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "export"
    ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "export/no-import-module-exports": "error"
    }
}
```

## Supported Rules

* **export/no-import-module-exports** Should not use module.exports or export.xxx when there are import sentences 