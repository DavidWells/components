const { LocalGit } = require('../localGit')

async function gitDetails(opts = {}) {
  const localPlatform = new LocalGit(opts)
  const git = await localPlatform.getPlatformGitRepresentation()
  return git
}

module.exports = {
  gitDetails
}
