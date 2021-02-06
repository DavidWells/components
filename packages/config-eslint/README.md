# ESLint Config

Shareable code style and best practice for JS projects.

## Install

Pure JavaScript:

```sh
npm install -D @davidwells/eslint-config eslint-config-standard eslint-plugin-promise eslint-plugin-jest eslint-plugin-node eslint-plugin-security eslint-plugin-import eslint-plugin-prefer-let eslint-plugin-prettierx eslint-plugin-unicorn eslint
```

TypeScript:

```sh
npm install -D @davidwells/eslint-config @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript eslint-config-standard eslint-plugin-promise eslint-plugin-jest eslint-plugin-node eslint-plugin-security eslint-plugin-import eslint-plugin-prefer-let eslint-plugin-prettierx eslint-plugin-unicorn eslint
```

## Usage

For JavaScript add config to `package.json` or other ESLint configs.

```js
"eslintConfig": {
  "extends": "@davidwells/eslint-config"
}
```

Overridee rules like so:

```js
"eslintConfig": {
  "extends": "@davidwells/eslint-config",
  "rules": {
    "unicorn/better-regex": "off"
  }
},
```


For TypeScript:

```js
"eslintConfig": {
  "extends": "@davidwells/eslint-config/ts"
}
```

## Rules

<!-- AUTO-GENERATED-CONTENT:START (CODE:src=./index.js) -->
<!-- The below code snippet is automatically added from ./index.js -->
```js
let globals = require('globals')

let jest = {}
for (let i in globals.jest) {
  if (i !== 'test' && i !== 'xtest') jest[i] = globals.jest[i]
}

module.exports = {
  plugins: [
    'import',
    'jest',
    'security',
    'node',
    'unicorn',
    'prefer-let',
    'prettierx'
  ],
  extends: ['standard'],
  rules: {
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-new-buffer': 'error',

    'node/no-unsupported-features/node-builtins': [
      'error',
      {
        ignores: ['worker_threads']
      }
    ],
    'node/no-unsupported-features/es-builtins': 'error',
    'node/no-unsupported-features/es-syntax': [
      'error',
      {
        ignores: ['modules', 'dynamicImport']
      }
    ],
    'node/no-unpublished-require': 'error',
    'node/no-extraneous-require': 'error',
    'node/no-missing-require': 'error',
    'node/global-require': 'error',

    'prefer-let/prefer-let': 'error',

    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/prefer-optional-catch-binding': 'error',
    'unicorn/prefer-default-parameters': 'error',
    'unicorn/prefer-keyboard-event-key': 'error',
    'unicorn/custom-error-definition': 'error',
    'unicorn/no-unused-properties': 'error',
    'unicorn/no-instanceof-array': 'error',
    'unicorn/empty-brace-spaces': 'error',
    'unicorn/prefer-array-some': 'error',
    'unicorn/prefer-date-now': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/better-regex': 'error',
    'unicorn/no-for-loop': 'error',
    // 'unicorn/prefer-regexp-test': 'error',

    'import/order': [
      'error',
      {
        'groups': [
          ['builtin', 'external'],
          ['internal', 'parent', 'sibling', 'index']
        ],
        'newlines-between': 'always'
      }
    ],

    'prettierx/options': [
      'error',
      {
        spaceBeforeFunctionParen: false,
        // breakLongMethodChains: true,
        breakLongMethodChains: false,
        trailingComma: 'es5',
        arrowParens: 'always',
        singleQuote: true,
        quoteProps: 'consistent',
        semi: false
      }
    ],

    'nonblock-statement-body-position': 'error',
    'prefer-exponentiation-operator': 'error',
    'no-misleading-character-class': 'error',
    'no-unsafe-optional-chaining': 'error',
    'prefer-arrow-callback': 'error',
    'no-this-before-super': 'error',
    'func-name-matching': 'error',
    'prefer-rest-params': 'error',
    'no-useless-return': 'error',
    'consistent-return': 'error',
    'multiline-ternary': ['error', 'never'],
    'no-nested-ternary': 'error',
    'constructor-super': 'error',
    'block-scoped-var': 'error',
    'object-shorthand': 'error',
    'no-setter-return': 'error',
    'no-invalid-this': 'error',
    'no-dupe-else-if': 'error',
    'no-unused-vars': [
      'error',
      {
        args: 'after-used',
        vars: 'all'
      }
    ],
    'require-yield': 'error',
    'no-new-symbol': 'error',
    'getter-return': 'error',
    'for-direction': 'error',
    'no-lonely-if': 'error',
    'no-shadow': 'error',

    'node/no-callback-literal': 'off',

    'comma-dangle': 'off',
    'no-whitespace-before-property': 'off',
    'space-before-function-paren': 'off',
    'computed-property-spacing': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'array-bracket-spacing': 'off',
    'space-before-blocks': 'off',
    'no-trailing-spaces': 'off',
    'space-infix-ops': 'off',
    'space-in-parens': 'off',
    'no-multi-spaces': 'off',
    'keyword-spacing': 'off',
    'no-extra-parens': 'off',
    'space-unary-ops': 'off',
    'spaced-comment': 'off',
    'comma-spacing': 'off',
    'arrow-spacing': 'off',
    'prefer-const': 'off',
    'brace-style': 'off',
    'quote-props': 'off',
    'max-len': 'off',
    'no-new': 'off',
    'quotes': 'off',
    'indent': 'off',
    'semi': 'off'
  },
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  overrides: [
    {
      files: ['test/*', 'test/**/*', '*.test.{js,jsx}', '*.test.{ts,tsx}'],
      rules: {
        'node/no-unpublished-require': 'off',
        'node/no-missing-require': [
          'error',
          {
            allowModules: ['worker_threads']
          }
        ]
      }
    },
    {
      files: ['*.test.{js,jsx}', '*.test.{ts,tsx}'],
      extends: ['plugin:jest/recommended', 'plugin:jest/style'],
      rules: {
        'jest/require-to-throw-message': 'error',
        'jest/no-deprecated-functions': 'error',
        'jest/no-restricted-matchers': [
          'error',
          {
            toBeTruthy: 'Avoid `toBeTruthy`',
            toBeFalsy: 'Avoid `toBeFalsy`'
          }
        ],
        'jest/prefer-hooks-on-top': 'error',
        'jest/no-duplicate-hooks': 'error',
        'jest/consistent-test-it': ['error', { fn: 'it' }],
        'jest/prefer-called-with': 'error',
        'jest/lowercase-name': 'error',
        'jest/prefer-spy-on': 'error',
        'jest/valid-title': 'error',
        'jest/prefer-todo': 'error',

        'jest/valid-expect-in-promise': 'off',
        'jest/expect-expect': 'off',

        'node/global-require': 'off',

        'no-unused-expressions': 'off'
      },
      globals: jest
    }
  ]
}
```
<!-- AUTO-GENERATED-CONTENT:END -->

## Props

Fork of [Logux eslint config](https://github.com/logux/eslint-config) ❤️
