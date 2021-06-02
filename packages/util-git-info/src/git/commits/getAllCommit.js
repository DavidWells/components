const { getFirstCommit } = require('./getFirstCommit')
const { getLastCommit } = require('./getLastCommit')
const { gitDetails } = require('../../index')

async function getAllCommits() {
  const firstCommit = await getFirstCommit()
  const lastCommit = await getLastCommit()
  const data = await gitDetails({
    // base === now
    base: lastCommit.hash,
    // head == start
    head: firstCommit.hash
  })
  return [firstCommit].concat(data.commits).concat(lastCommit)
}

//*
getAllCommits().then((d) => {
  console.log('xd', d)
})
/**/

module.exports = {
  getAllCommits
}
