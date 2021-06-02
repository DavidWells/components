const { getAllCommits } = require('../src')

getAllCommits().then((commits) => {
  commits.forEach((commit) => {
    console.log(`# ${commit.subject}`)
    if (commit.body) {
      console.log(`${commit.body}`)
    }
    console.log('───────────────────────')
  })
})
