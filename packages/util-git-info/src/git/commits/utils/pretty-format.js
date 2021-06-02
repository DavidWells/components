const splitCharacter = '<##>'

// https://git-scm.com/docs/pretty-formats
const prettyFormat = ['%h', '%H', '%s', '%f', '%b', '%aI', '%cI', '%an', '%ae', '%cn', '%ce', '%N', '']

function getPrettyFormat() {
  return prettyFormat.join(splitCharacter)
}

function parse(gitString) {
  // console.log('gitString', gitString)
  const a = gitString.split(splitCharacter)
  console.log('a', a)
  // e.g. master\n or master\nv1.1\n or master\nv1.1\nv1.2\n
  const branchAndTags = a[a.length - 1].split('\n').filter(n => n)
  // console.log('branchAndTags', branchAndTags)
  const branch = branchAndTags[0]
  const tags = branchAndTags.slice(1)

  return {
    // shortSha: a[0],
    sha: a[1],
    subject: a[2],
    sanitizedSubject: a[3],
    body: a[4],
    author: {
      name: a[7],
      email: a[8],
    },
    committer: {
      name: a[9],
      email: a[10]
    },
    authoredOn: a[5],
    committedOn: a[6],
    notes: a[11],
    branch,
    tags
  }
}

module.exports = {
  getPrettyFormat,
  parse
}
