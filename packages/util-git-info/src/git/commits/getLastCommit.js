const { executeCommand } = require('../utils/exec')
const { parse, getPrettyFormat, removeSignedOffBy } = require('./utils/pretty-format')
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

function getCurrentRevision() {
  return new Promise((resolve, reject) => {
    executeCommand('git rev-parse HEAD', (err, res) => {
      if (err) return reject(err)
      const sha = res.toString().trim()
      resolve({
        sha: sha,
        shortSha: sha.slice(0, 7)
      })
    })
  })
}

function getCurrentCommitMessage() {
  return new Promise((resolve, reject) => {
    executeCommand('git show -s --format=%B HEAD', (err, res) => {
      if (err) return reject(err)
      resolve(removeSignedOffBy(res.toString()).trim())
    })
  })
}

/*
getLastCommit().then((d) => {
  console.log('getLastCommit', d)
})
/**/

/*
getCurrentRevision().then((d) => {
  console.log('getCurrentRevision', d)
})
/**/

/*
getCurrentCommitMessage().then((commitMessage) => {
  console.log('getCurrentCommitMessage')
  console.log(commitMessage)
})
/**/

module.exports = {
  getLastCommit,
  getCurrentRevision,
  getCurrentCommitMessage
}
