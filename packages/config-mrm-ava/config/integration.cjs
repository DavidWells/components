const baseTestConfig = require('./tests/_config.js')

module.exports = {
  ...baseTestConfig,
  serial: true,
  timeout: '90s',
  files: ['tests/integration/**/*.test.js'],
  require: ['./tests/integration/setup.js'],
  environmentVariables: {
    MY_ENVIRONMENT_VARIABLE: 'some value'
  },
}
