const parseDiff = require('parse-diff')
const includes = require('lodash.includes')
/**
 * This function is essentially a 'go from a diff to some simple structured data'
 * it's the steps needed for danger process.
 */

module.exports.diffToGitJSONDSL = (diff, commits) => {
  const fileDiffs = parseDiff(diff)
  const addedDiffs = fileDiffs.filter(diff => diff['new'])
  const removedDiffs = fileDiffs.filter(diff => diff['deleted'])
  const modifiedDiffs = fileDiffs.filter(
    diff => !includes(addedDiffs, diff) && !includes(removedDiffs, diff)
  )
  return {
    // Work around for danger/danger-js#807
    modified_files: modifiedDiffs.map(
      d => d.to || (d.from && d.from.split(' b/')[0])
    ),
    created_files: addedDiffs.map(d => d.to),
    deleted_files: removedDiffs.map(d => d.from),
    commits: commits
  }
}
