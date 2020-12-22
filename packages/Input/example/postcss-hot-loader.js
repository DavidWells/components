
// Hot reload webpack files for PostCSS
module.exports = function hotReloader({
  configPath,
  variablesPath,
  mixinsPath,
  ...other
}) {
  // Return hot loaded plugins
  return (webpackInstance) => {
    /* Hot load variables */
    const varFileContents = () => {
      if (!variablesPath) return {}
      const variablesFile = require.resolve(variablesPath)
      webpackInstance.addDependency(variablesFile)
      delete require.cache[variablesFile]
      return require(variablesFile)
    }
    /* Hot load Mixins */
    const mixinContents = () => {
      if (!mixinsPath) return {}
      const mixinsFile = require.resolve(mixinsPath)
      webpackInstance.addDependency(mixinsFile)
      delete require.cache[mixinsFile]
      return require(mixinsFile)
    }
    /* Hot load postCSS plugins config array */
    webpackInstance.addDependency(configPath)
    delete require.cache[configPath]
    return require(configPath)({
      variables: varFileContents(),
      mixins: mixinContents(),
      ...other
    })
  }
}
