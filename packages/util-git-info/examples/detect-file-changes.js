const { gitDetails } = require('../src')

async function detectFileChanges() {
  let gitInfo
  try {
    gitInfo = await gitDetails({
      // Starting commit to go back to
      from: '7d7162118aeb2bd9b7f0e12f4a8ff63a4c928d21',
      // Ending commit
      to: '79f8d526b734749783c429271718b5273c77f601'
    })
  } catch (err) {
    console.log('Error getting git info')
    console.log(err)
    return
  }
  // // Check if files we care about are modified
  const filesChanged = gitInfo.fileMatch([
    '**/**/package.json',
    // '**/**.js'
  ])
  if (filesChanged.edited) {
    console.log('srcCode has been edited')
    console.log(filesChanged.edited)
    console.log('This files have changed')
    console.log(filesChanged.editedFiles)
    // Do stuff more stuff
  }
  console.log(filesChanged.getKeyedPaths())
}

detectFileChanges()
