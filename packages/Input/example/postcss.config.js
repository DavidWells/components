
/* Return postCSS config */
function getPostCSSConfig({ variables, mixins }) {
  return {
    /* https://github.com/postcss/postcss-import */
    'postcss-import': {},
    /* https://github.com/postcss/postcss-simple-vars */
    'postcss-simple-vars': {
      variables: () => variables,
      unknown: (node, name, result) => {
        const file = node.source.input.file.replace(process.cwd(), '')
        const message = `Unknown variable "${name}" used in "${node.prop}: ${node.value};"\nin CSS file ${file}`
        node.warn(result, require('kleur').red(message))
      }
    },
    /* https://github.com/postcss/postcss-mixins */
    'postcss-mixins': {
      mixins: mixins
    },
    /* https://github.com/postcss/postcss-color-function */
    'postcss-color-function': {},
    /* https://github.com/postcss/postcss-custom-properties */
    'postcss-custom-properties': {},
    /* https://github.com/postcss/postcss-custom-media */
    'postcss-custom-media': {},
    /* https://github.com/postcss/postcss-media-minmax */
    'postcss-media-minmax': {},
    /* https://github.com/postcss/postcss-calc */
    'postcss-calc': {},
    /* https://github.com/shauns/postcss-math */
    'postcss-math': {},
    /* https://github.com/postcss/postcss-nested */
    'postcss-nested': {},
    /* https://github.com/iamvdo/pleeease-filters */
    'pleeease-filters': {},
    /* https://github.com/postcss/postcss-selector-matches */
    'postcss-selector-matches': {},
    /* https://github.com/postcss/postcss-selector-not */
    'postcss-selector-not': {},
    /* https://github.com/luisrudge/postcss-flexbugs-fixes */
    'postcss-flexbugs-fixes': {},
    // /* https://github.com/maximkoretskiy/postcss-initial */
    // 'postcss-initial': {
    //   // reset only inherited rules
    //   reset: 'inherited'
    // },
    /* https://github.com/csstools/postcss-preset-env */
    'postcss-preset-env': {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
      features: {
        'custom-properties': false,
      },
    },
  }
}

module.exports = ({
  variables,
  mixins,
  variableOverrides = {},
  mixinOverrides = {}
}) => {
  const designTokens = {
    ...variables,
    ...variableOverrides
  }
  const mixinFunctions = {
    ...(typeof mixins === 'function') ? mixins(designTokens) : mixins,
    ...mixinOverrides
  }
  // Load up plugins with variables and mixins
  const plugins = getPostCSSConfig({
    variables: designTokens,
    mixins: mixinFunctions,
  })
  console.log('plugins', plugins)
  // Needed for CRA
  return createPostCSSPluginArray(plugins)
}

// Convert PostCSS object post css to array for creat react app
function createPostCSSPluginArray(postCSSPlugins) {
  return Object.keys(postCSSPlugins).reduce((acc, plugin) => {
    const pluginInfo = postCSSPlugins[plugin]
    if (Object.keys(pluginInfo)) {
      const include = require(plugin)(pluginInfo)
      acc = acc.concat(include)
      return acc
    }
    const include = require(plugin)
    acc = acc.concat(include)
    return acc
  }, [])
}
