const { packageJson, install } = require('mrm-core')

function task(config) {
  console.log('config', config)
  // Update package.json
  const pkg = packageJson().merge({
    scripts: {
      test: 'ava -v',
      watch: 'npm test -- --watch -v',
    },
    ava: {
      files: [
        'tests/**/*',
        '!test/exclude-files-in-this-directory',
        '!**/exclude-files-with-this-name.*'
      ],
      concurrency: 5,
      failFast: true,
      failWithoutAssertions: false,
      environmentVariables: {
        MY_ENVIRONMENT_VARIABLE: 'some value'
      },
      require: [
        'esm'
      ],
      verbose: true,
      nodeArguments: []
    }
  })
  // Save package.json
  pkg.save()
  // Install dependancy
  install('ava')
}

task.description = 'Adds ava testing to the project'
const allowedValues = ['tab', 2, 4, 8]
task.parameters = {
  indent: {
    type: 'input',
    message: 'Choose indentation style (tabs or number of spaces)',
    default: 'tab',
    choices: allowedValues,
    validate(value) {
      console.log('indent value', value)
      return allowedValues.includes(value)
    }
  },
  prettierPattern: {
    type: 'input',
    message: 'Enter Prettier file glob pattern',
    default: 'auto',
  },
  // prettierOptions: {
  //   type: 'config',
  // },
  // prettierOverrides: {
  //   type: 'config',
  // },
  eslintPreset: {
    type: 'input',
    message: 'ESLint preset to use as basis',
    validate(value) {
      return value ? true : 'eslintPreset is required'
    }
  },
  includeContributing: {
    type: 'confirm',
    message: 'Include Contributing section linking to Contributing file?',
    default: true,
  },
}
module.exports = task
