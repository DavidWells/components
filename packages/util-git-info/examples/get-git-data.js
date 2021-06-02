const util = require('util')
const { getFirstCommit, getLastCommit, gitDetails } = require('../src')

async function checkGitForStuff() {
  let firstEverCommit
  let lastCommit
  let allGitInfo
  try {
    firstEverCommit = await getFirstCommit()
    console.log('firstEverCommit', firstEverCommit)
    lastCommit = await getLastCommit()
    allGitInfo = await gitDetails({
      // base === now
      base: lastCommit.sha,
      // head == start
      head: firstEverCommit.sha
    })
  } catch (err) {
    console.log('Error getting git info')
    console.log(err)
    return
  }
  console.log(util.inspect(allGitInfo, { showHidden: false, depth: null }))
  console.log(`${allGitInfo.commits.length} commits total.`)
  console.log('lastCommit', lastCommit)
  console.log('firstEverCommit', firstEverCommit)
}

checkGitForStuff()
