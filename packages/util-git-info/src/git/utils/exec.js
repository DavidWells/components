const process = require('child_process')

function executeCommand(command, opts, cb) {
  let dst = __dirname
  const callback = (typeof opts === 'function') ? opts : cb
  const options = (typeof opts === 'object') ? opts : null
  if (!!options && options.dst) {
    dst = options.dst
  }

  process.exec(command, { cwd: dst }, function(err, stdout, stderr) {
    if (err) console.log(err)
    if (stdout === '') {
      callback(new Error('this does not look like a git repo'))
      return
    }
    if (stderr) {
      return callback(stderr)
    }
    callback(null, stdout)
  })
}

module.exports = { executeCommand }
