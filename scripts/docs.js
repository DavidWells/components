const path = require('path')
const markdownMagic = require('markdown-magic')

const config = {
  transforms: {
    PACKAGE_LIST: require('markdown-magic-subpackage-list')
  }
}

const markdownPath = path.join(__dirname, '..', 'README.md')
markdownMagic(markdownPath, config, () => {
  console.log('Docs ready!')
})
