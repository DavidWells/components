const { LocalGit } = require('./localGit')
const { getCommit } = require('./git/commits/getCommit')
const { getFirstCommit } = require('./git/commits/getFirstCommit')
const { getLastCommit } = require('./git/commits/getLastCommit')

async function gitDetails(opts = {}) {
  const localPlatform = new LocalGit(opts)
  const git = await localPlatform.getPlatformGitRepresentation()
  return git
}

module.exports = {
  getCommit,
  getFirstCommit,
  getLastCommit,
  gitDetails
}
