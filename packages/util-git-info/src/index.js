const { gitDetails } = require('./git/getDetails')
const { getCommit } = require('./git/commits/getCommit')
const { getFirstCommit } = require('./git/commits/getFirstCommit')
const { getLastCommit } = require('./git/commits/getLastCommit')
const { getAllCommits } = require('./git/commits/getAllCommits')

module.exports = {
  getCommit,
  getFirstCommit,
  getLastCommit,
  getAllCommits,
  gitDetails
}
