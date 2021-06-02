const { executeCommand } = require('../utils/exec')
const { parse, getPrettyFormat } = require('./utils/pretty-format')

// Via https://github.com/seymen/git-last-commit/blob/master/source/index.js

function getLastCommit() {
  const command = `git log -1 --pretty=format:"${getPrettyFormat()}" && git rev-parse --abbrev-ref HEAD && git tag --contains HEAD`
  return new Promise((resolve, reject) => {
    executeCommand(command, (err, res) => {
      if (err) return reject(err)
      resolve(parse(res))
    })
  })
}

/*
getLastCommit().then((d) => {
  console.log('getLastCommit', d)
})
/**/

module.exports = {
  getLastCommit
}
