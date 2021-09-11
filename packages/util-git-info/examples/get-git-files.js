const path = require('path')
const util = require('util')
const { getGitFiles } = require('../src')

async function getFiles() {
  let files
  try {
    files = await getGitFiles(path.join(__dirname, '..'))
  } catch (err) {
    console.log('Error getting git file info')
    console.log(err)
    return
  }
  console.log(util.inspect(files, { showHidden: false, depth: null }))
  console.log(`${Object.keys(files).length} Files`)
}

getFiles()
