const fs = require('fs')
const path = require('path')

function findUp(name, cwd = process.cwd()) {
  let up = path.resolve(cwd)
  do {
    cwd = up
    const p = path.resolve(cwd, name)
    if (fs.existsSync(p)) return cwd
    up = path.resolve(cwd, '../')
  } while (up !== cwd)
}

module.exports = {
  findUp
}
