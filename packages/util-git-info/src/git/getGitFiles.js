const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { findUp } = require('./utils/find-up')

const regex = /^([A-Z?])\s+(\d{6})\s+([a-z0-9]{40})\s+(\d+)\s+(.*)$/u

async function getGitFiles(dir) {
  const directory = (dir) ? dir : findUp('.git', process.cwd())
  if (!directory) {
    throw new Error(`Not a Git repository ${directory}`)
  }

  return new Promise((resolve, reject) => {
    exec(
      'git ls-files --full-name -s -d -c -m -o --directory -t',
      { cwd: directory, maxBuffer: 1024 * 1024 * 1024 },
      (error, stdout) => {
        if (error) return reject(error)
        return resolve(parseFiles(stdout, directory))
      }
    )
  })
}

function parseFiles(data, dir) {
  const ret = {}
  data.split('\n').forEach((line) => {
    const m = regex.exec(line)
    if (m) {
      const file = m[5]
      let hash = m[3]
      if (m[1] === 'C') {
        const filePath = path.resolve(dir, file)
        hash += fs.existsSync(filePath) ? `.${fs.lstatSync(filePath).mtimeMs}` : '.del'
      }
      ret[file] = hash
    } else {
      const file = line.slice(2)
      const filePath = path.resolve(dir, file)
      if (file && fs.existsSync(filePath)) {
        ret[file] = `${fs.lstatSync(filePath).mtimeMs}`
      }
    }
  })
  return ret
}

const cache = {}

async function getGitFilesRelative(directory, exclude = []) {
  const root = findUp('.git', directory)
  if (!root) throw new Error(`Not a Git repository ${directory}`)

  if (!cache[root]) {
    cache[root] = await getGitFiles(root)
  }
  const files = cache[root]
  const ret = {}

  Object.entries(files)
    .filter(([file]) => {
      const filePath = path.resolve(root, file)
      if (file && exclude.includes(file)) return false
      return (
        filePath === directory || filePath.startsWith(directory + path.sep)
      )
    })
    .map(([file, hash]) => [
      path.relative(directory, path.resolve(root, file)),
      hash,
    ])
    .filter(([file]) => file.length && !exclude.includes(file))
    .forEach(([file, hash]) => (ret[file] = hash))

  return ret
}

module.exports = {
  getGitFiles,
  getGitFilesRelative
}
