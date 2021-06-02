const { getCommit } = require('./getCommit')
const { spawn } = require('child_process')

/**
 * Get first commit hash of repo
 * @returns {String} hash
 */
function getFirstCommitHash() {
  return new Promise((resolve, reject) => {
    // git rev-list --max-parents=0 HEAD
    let stdout = ''
    const args = ['rev-list', '--max-parents=0', 'HEAD', '--reverse']
    const child = spawn('git', args, { env: process.env })
    child.stdout.on('data', chunk => {
      stdout += chunk
    })
    child.stderr.on('data', data => reject(data.toString()))
    child.on('close', function(code) {
      if (code === 0) {
        resolve(stdout.trim())
      }
    })
  })
}

/**
 * Get first commit details of repo
 * @returns {Object} commit details
 */
async function getFirstCommit() {
  const hash = await getFirstCommitHash()
  return getCommit(hash)
}

/*
// Example
getFirstCommit().then((d) => {
  console.log('getFirstCommit', d)
})
/**/

module.exports = {
  getFirstCommit,
  getFirstCommitHash
}
