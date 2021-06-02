const { getFirstCommit } = require('./getFirstCommit')
const { getLastCommit } = require('./getLastCommit')
const { gitDetails } = require('../getDetails')

async function getAllCommits() {
  const firstCommit = await getFirstCommit()
  // console.log('firstCommit', firstCommit)
  const lastCommit = await getLastCommit()
  // console.log('lastCommit', lastCommit)
  const data = await gitDetails({
    // base === now
    base: lastCommit.sha,
    // head == start
    head: firstCommit.sha
  })
  // console.log('data.commits', data.commits.reverse())
  // process.exit(1)
  return [firstCommit].concat(data.commits.reverse()).concat(lastCommit)
}

/*
getAllCommits().then((d) => {
  console.log('xd', d)
})
/**/

module.exports = {
  getAllCommits
}
