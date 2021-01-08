/* https://github.com/zoubin/postcss-comment - Allow postcss to support inline comments. */
const commentParser = require('postcss-comment')

module.exports = function loaderOptions(postcssPlugins) {
  return (postcssLoaderOptions, { env, paths }) => {
    /* Hot reload modules */
    postcssLoaderOptions.map = env === 'development' ? { inline: true } : false
    postcssLoaderOptions.parser = commentParser
    postcssLoaderOptions.plugins = postcssPlugins
    return postcssLoaderOptions
  }
}
