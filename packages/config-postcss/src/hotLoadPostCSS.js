// Hot reload webpack files for PostCSS
module.exports = function hotReloader({
  configPath,
  variablesPath,
  mixinsPath,
  functionsPath,
  ...other
}) {
  // Return hot loaded plugins
  return (webpackInstance) => {
    /* Hot load CSS variables */
    const varFileContents = () => {
      if (!variablesPath) return {}
      const variablesFile = require.resolve(variablesPath)
      webpackInstance.addDependency(variablesFile)
      delete require.cache[variablesFile]
      return require(variablesFile)
    }
    /* Hot load CSS mixins */
    const mixinContents = () => {
      if (!mixinsPath) return {}
      const mixinsFile = require.resolve(mixinsPath)
      webpackInstance.addDependency(mixinsFile)
      delete require.cache[mixinsFile]
      return require(mixinsFile)
    }
    /* Hot load CSS functions */
    const functionContents = () => {
      if (!functionsPath) return {}
      const functionsFile = require.resolve(functionsPath)
      webpackInstance.addDependency(functionsFile)
      delete require.cache[functionsFile]
      return require(functionsFile)
    }
    /* Hot load postCSS plugins config array */
    webpackInstance.addDependency(configPath)
    delete require.cache[configPath]
    return require(configPath)({
      variables: varFileContents(),
      mixins: mixinContents(),
      functions: functionContents(),
      ...other
    })
  }
}
