const path = require('path')
const fs = require('fs')
const copyTemplate = require('copy-template-dir')
const argv = require('minimist')(process.argv.slice(2));
const componentName = argv.name
const componentType = argv.type
var templateDir

if (!componentName) {
  console.log('Error! Must pass in component name. --name=ComponentName')
  return false
}

const outputDir = path.join(__dirname, `../packages/${componentName}`)

if (componentType) {
  templateDir = path.join(__dirname, `../templates/${componentType}`)
} else {
  templateDir = path.join(__dirname, `../templates/component`)
}

/* if directory exists delete it first */
if (fs.existsSync(outputDir)) {
  console.log(`${componentName} directory already exists.`)
  console.log(`Delete ${componentName} directory manually to generate this component`)
  return false
}

const templateVariables = {
  ComponentName: componentName,
  ComponentNameLowerCase: componentName.toLowerCase()
}

copyTemplate(templateDir, outputDir, templateVariables, (err, createdFiles) => {
  if (err) throw err

  createdFiles.forEach((filePath) => {
    var newName = filePath.replace('ComponentName', componentName)
    fs.rename(`${filePath}`, newName, function(err) {
      if (err) {
        console.log('ERROR: ' + err)
      }
      console.log(`Created ${newName}`)
    })
  })
})
