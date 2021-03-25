const { debug } = require('../debug')
const { exec } = require('child_process')

const d = debug('localGetFileAtSHA')

const localGetFileAtSHA = (path, _repo, sha) => {
  return new Promise(resolve => {
    const call = `git show ${sha}:'${path}'`
    d(call)
    exec(call, (err, stdout, _stderr) => {
      if (err) {
        // console.error(`Could not get the file ${path} from git at ${sha}`)
        // console.error(err)
        return resolve()
      }
      resolve(stdout)
    })
  })
}

module.exports.localGetFileAtSHA = localGetFileAtSHA
