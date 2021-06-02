const { readFileSync } = require('fs')
const { gitJSONToGitDSL } = require('./git/gitJSONToGitDSL')
const { diffToGitJSONDSL } = require('./git/diffToGitJSONDSL')
const { localGetDiff } = require('./git/localGetDiff')
const { localGetFileAtSHA } = require('./git/localGetFileAtSHA')
const { localGetCommits } = require('./git/localGetCommits')

class LocalGit {
  constructor(options) {
    this.options = options
    this.getFileContents = path => {
      // eslint-disable-next-line promise/param-names
      return new Promise(res => res(readFileSync(path, 'utf8')))
    }
    this.name = 'local git'
    this.base = this.options.from || this.options.base || 'master'
    this.head = this.options.to || this.options.head || 'HEAD'
  }
  async getGitDiff() {
    if (this.gitDiff) {
      return this.gitDiff
    }
    this.gitDiff = await localGetDiff(this.base, this.head)
    return this.gitDiff
  }
  async validateThereAreChanges() {
    const diff = await this.getGitDiff()
    return diff.trim().length > 0
  }
  async getPlatformReviewDSLRepresentation() {
    return null
  }
  async getPlatformGitRepresentation() {
    const base = this.base
    const head = this.head
    const diff = await this.getGitDiff()
    // Array of commits
    const commits = await localGetCommits(base, head)
    // console.log('commits', commits)
    const gitJSON = diffToGitJSONDSL(diff, commits)
    const config = {
      repo: process.cwd(),
      baseSHA: base,
      headSHA: head,
      getFileContents: localGetFileAtSHA,
      getFullDiff: localGetDiff
    }
    return gitJSONToGitDSL(gitJSON, config)
  }
  async getInlineComments(_) {
    return []
  }
  async getReviewInfo() {
    return {}
  }
}

module.exports.LocalGit = LocalGit
