const { packageJson } = require('mrm-core')

function task({ src, out }) {
  console.log('Add "npm run types" to package.json')
  // Update package.json
  const pkg = packageJson().merge({
    scripts: {
      types: `npx tsc ${src}/*.js --declaration --allowJs --emitDeclarationOnly --outDir ${out}`,
    },
  })
  // Save package.json
  pkg.save()
}

task.description = 'Adds JS doc to typescript declaration'
task.parameters = {
  src: {
    type: 'input',
    message: 'Source directory',
    default: 'src',
    validate(value) {
      return value ? true : 'src dir is required'
    }
  },
  out: {
    type: 'input',
    message: 'Output directory',
    default: '.',
    validate(value) {
      return value ? true : 'output dir is required'
    }
  },
}
module.exports = task
