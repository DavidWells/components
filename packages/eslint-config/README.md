# ESLint Config

Shareable code style and best practice for JS projects.

## Install

Pure JavaScript:

```sh
npm install --dev @davidwells/eslint-config eslint-config-standard eslint-plugin-promise eslint-plugin-jest eslint-plugin-node eslint-plugin-security eslint-plugin-import eslint-plugin-prefer-let eslint-plugin-prettierx eslint-plugin-unicorn eslint -D
```

TypeScript:

```sh
npm install --dev @davidwells/eslint-config @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript eslint-config-standard eslint-plugin-promise eslint-plugin-jest eslint-plugin-node eslint-plugin-security eslint-plugin-import eslint-plugin-prefer-let eslint-plugin-prettierx eslint-plugin-unicorn eslint -D
```

## Usage

For JavaScript add config to `package.json` or other ESLint configs.

```js
  "eslintConfig": {
    "extends": "@davidwells/eslint-config"
  }
```

For TypeScript:

```js
  "eslintConfig": {
    "extends": "@davidwells/eslint-config/ts"
  }
```

## Props

Fork of [Logux eslint config](https://github.com/logux/eslint-config) ❤️
