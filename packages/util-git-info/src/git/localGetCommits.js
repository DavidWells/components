const JSON5 = require('json5')
const { spawn } = require('child_process')
const { debug } = require('../debug')
const { removeSignedOffBy } = require('./commits/utils/pretty-format')

const d = debug('localGetDiff')
const sha = '%H'
const parents = '%p'
const authorName = '%an'
const authorEmail = '%ae'
const authorDate = '%aI'
const committerName = '%cn'
const committerEmail = '%ce'
const committerDate = '%cI'
const subject = '%s'
const message = '%f' // this is subject, not message, so it'll only be one line
const body = '%b'
const author = `"author": {"name": "${authorName}", "email": "${authorEmail}" }`
const committer = `"committer": {"name": "${committerName}", "email": "${committerEmail}" }`
const details = `"subject": "${subject}", "sanitizedSubject": "${message}", "body": "${body}"`
const dateInfo = `"authoredOn": "${authorDate}", "committedOn": "${committerDate}", "body": "${body}"`

const formatJSON = `{ "sha": "${sha}", "parents": "${parents}", ${author}, ${committer}, ${details}, ${dateInfo}},`
// console.log('formatJSON', formatJSON)
/*
  authoredOn: a[5],
  committedOn: a[6],
*/

const localGetCommits = (base, head) => {
  return new Promise(resolve => {
    const args = ['log', `${base}...${head}`, `--pretty=format:${formatJSON}`]
    const child = spawn('git', args, { env: process.env })
    let stdOut = ''
    let stdErr = ''
    let realCommits = []
    d('> git', args.join(' '))
    child.stdout.on('data', async data => {
      data = data.toString()
      stdOut += data.toString()

      let jsonValue = data.substring(0, data.length - 1)

      /* If JSON has new lines we must remove them  */
      // was /"body":\s+?("[\s\S]*?")/gm
      const pattern = /("[\s\S]*?")/gm
      const matches = jsonValue.match(pattern)
      const singleMatch = /("[\s\S]*?")/
      for (let i = 0; i < matches.length; i++) {
        const foundMatch = singleMatch.exec(matches[i])
        if (foundMatch && foundMatch[1]) {
          /* Replace all new lines */
          // Trim outer quotes to fix inner quotes
          let fixedValue = foundMatch[1].replace(/^"/, '').replace(/"$/, '')
            // foundMatch[1].substring(1, foundMatch[1].length - 1)
            /* Remove all new line characters & use \n placeholder */
            .replace(/(\r\n|\n|\r)/gm, '\\n')
            // Replace inner double quotes
            .replace(/"/gm, '\\"')

          // console.log('result', fixedValue)
          // .replace(/"/gm, '\\"')
          /* Remove signed off by git messages */
          fixedValue = removeSignedOffBy(fixedValue)
          // console.log('fixedValue', fixedValue)
          jsonValue = jsonValue.replace(foundMatch[1], `"${fixedValue}"`)
        }
      }

      // remove trailing comma, and wrap into an array
      const asJSONString = `[${jsonValue}]`
      let commits = []
      try {
        commits = JSON5.parse(asJSONString)
      } catch (err) {
        console.log('JSON parse error')
        console.log(err.message)
        console.log(asJSONString)
        throw new Error(err)
      }
      realCommits = realCommits.concat(commits.map(c =>
        Object.assign(Object.assign({}, c), { parents: c.parents.split(' ') })
      ))
    })
    child.stderr.on('data', data => {
      stdErr += data.toString()
      console.error(`Could not get commits from git between ${base} and ${head}`)
      throw new Error(data.toString())
    })
    child.on('close', (code) => {
      if (code === 0) {
        // console.log(`exit_code = ${code}`);
        // console.log('no commits found')
        return resolve(realCommits)
      }
      // console.log(`exit_code = ${code}`);
      return resolve(stdErr)
    })
    child.on('error', (error) => {
      stdErr += error.toString()
      if (stdOut || stdErr) {
        console.log(error.toString())
      }
    })
  })
}

module.exports.formatJSON = formatJSON
module.exports.localGetCommits = localGetCommits
