const { executeCommand } = require('../utils/exec')
const { parse, getPrettyFormat } = require('./utils/pretty-format')

function getCommit(hash, options) {
  /* git show
    --format="%h<##>%H<##>%s<##>%f<##>%b<##>%at<##>%ct<##>%an<##>%ae<##>%cn<##>%ce<##>%N<##>"
    -s 7d7162118aeb2bd9b7f0e12f4a8ff63a4c928d21
  */
  const command = `git show --format="${getPrettyFormat()}" -s ${hash} && git rev-parse --abbrev-ref HEAD && git tag --contains HEAD`
  return new Promise((resolve, reject) => {
    executeCommand(command, options, function(err, res) {
      if (err) return reject(err)
      resolve(parse(res))
    })
  })
}

//*
getCommit('ff078dd8decb1b9a9bfd1ed236525f705f2ccc1b').then((d) => {
  console.log('d', d)
})
/**/

module.exports = {
  getCommit
}
