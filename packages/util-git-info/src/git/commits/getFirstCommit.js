const { getCommit } = require('./getCommit')
const { spawn } = require('child_process')

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

async function getFirstCommit() {
  const hash = await getFirstCommitHash()
  return getCommit(hash)
}

/*
getFirstCommit().then((d) => {
  console.log('xd', d)
})
/**/

module.exports = {
  getFirstCommit,
  getFirstCommitHash
}
