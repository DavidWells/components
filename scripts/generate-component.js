const path = require('path')
const fs = require('fs')
const copyTemplate = require('copy-template-dir')
const argv = require('minimist')(process.argv.slice(2));
const packageName = argv.name
const templateType = argv.type
var templateDir

if (!packageName) {
  console.log('Error! Must pass in component name. --name=packageName')
  return false
}

const outputDir = path.join(__dirname, `../packages/${packageName}`)
console.log('templateType', templateType)
if (templateType) {
  templateDir = path.join(__dirname, `../templates/${templateType}`)
} else {
  templateDir = path.join(__dirname, `../templates/component`)
}

/* if directory exists delete it first */
if (fs.existsSync(outputDir)) {
  console.log(`${packageName} directory already exists.`)
  console.log(`Delete ${packageName} directory manually to generate this component`)
  return false
}

const templateVariables = {
  packageName: packageName,
  ComponentName: packageName,
  ComponentNameLowerCase: packageName.toLowerCase()
}

copyTemplate(templateDir, outputDir, templateVariables, (err, createdFiles) => {
  if (err) throw err

  createdFiles.forEach((filePath) => {
    var newName = filePath.replace('ComponentName', packageName)
    fs.rename(`${filePath}`, newName, function(err) {
      if (err) {
        console.log('ERROR: ' + err)
      }
      console.log(`Created ${newName}`)
    })
  })
})
