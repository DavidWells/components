const util = require('util')
const gitData = require('./src')

const GIT_COMMIT_REF = '2a2bf57fd5ab72550bf5c2f555af338d096d336b'

async function checkGitForStuff() {
  let gitInfo
  try {
    gitInfo = await gitData({
      base: GIT_COMMIT_REF,
    })
  } catch (err) {
    console.log('Error getting git info')
    console.log(err)
    return
  }

  // Log object
  console.log(util.inspect(gitInfo, { showHidden: false, depth: null }))

  // Check if files we care about are modified
  const srcCode = gitInfo.fileMatch('**/*.js')
  console.log('srcCode', srcCode)
  if (srcCode.edited) {
    console.log('srcCode has been edited')
    // Do stuff
  }
  console.log(srcCode.getKeyedPaths())
}

checkGitForStuff()
