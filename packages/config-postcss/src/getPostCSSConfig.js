const getPostCSSPlugins = require('./getPostCSSPlugins')

module.exports = ({
  env,
  variables,
  mixins,
  functions,
  variableOverrides = {},
  mixinOverrides = {},
  functionOverrides = {},
  isNext = false
}) => {
  const designTokens = {
    ...variables,
    ...variableOverrides
  }
  const mixinFunctions = {
    ...(typeof mixins === 'function') ? mixins(designTokens) : mixins,
    ...mixinOverrides
  }
  const funcs = {
    ...(typeof functions === 'function') ? functions(designTokens) : functions,
    ...functionOverrides
  }
  // Load up plugins with variables and mixins
  const plugins = getPostCSSPlugins({
    env: env,
    variables: designTokens,
    mixins: mixinFunctions,
    functions: funcs
  })
  // console.log('plugins', plugins)

  if (isNext) {
    return plugins
  }
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
