// Echo what deps to install
const pkg = require('./package.json')

const installMessage = Object.keys(pkg.peerDependencies).reduce((acc, dep) => {
  // const depInfo = pkg.peerDependencies[dep]
  acc = acc.concat(dep)
  return acc
}, [])

console.log(`${pkg.name} installed\n`)
console.log('Make sure to install other ESLint deps\n')
console.log(`npm install -D ${installMessage.join(' ')}\n`)
