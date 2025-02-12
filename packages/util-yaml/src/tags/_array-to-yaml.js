const YAML = require('yaml')
const { cleanValue } = require('./_clean-value')
function arrayToYaml(arr, indent = 0) {
  console.log('arrayToYaml', arr)
  let result = ''

  arr.forEach((item, index) => {
    const spaces = ' '.repeat(indent)
    const isLastItem = index === arr.length - 1

    if (Array.isArray(item)) {
      if (item.length === 0) {
        result += `${spaces}- []\n`
      } else {
        result += `${spaces}- ${arrayToYaml(item, indent + 2).trimLeft()}`
      }
    } else if (item && typeof item === 'object') {
      console.log('item', item)
      // Handle each intrinsic function
      if ('Fn::Join' in item) {
        result += `${spaces}- !Join\n`
        result += `${spaces}  - '${item['Fn::Join'][0]}'\n`
        result += `${spaces}  - ${arrayToYaml(item['Fn::Join'][1], indent + 4).trimLeft()}`
      } else if ('Fn::Ref' in item) {
        result += `${spaces}- !Ref ${item['Fn::Ref']}`
      } else if ('Fn::GetAtt' in item) {
        result += `${spaces}- !GetAtt ${item['Fn::GetAtt'].join('.')}`
      } else if ('Fn::Sub' in item) {
        if (Array.isArray(item['Fn::Sub'])) {
          result += `${spaces}- !Sub\n`
          result += `${spaces}  - '${item['Fn::Sub'][0]}'\n`
          result += `${spaces}  - ${arrayToYaml(item['Fn::Sub'][1], indent + 4).trimLeft()}`
        } else {
          result += `${spaces}- !Sub '${item['Fn::Sub']}'`
        }
      } else if ('Fn::ImportValue' in item) {
        result += `${spaces}- !ImportValue ${item['Fn::ImportValue']}`
      } else if ('Fn::FindInMap' in item) {
        result += `${spaces}- !FindInMap [${item['Fn::FindInMap'].join(', ')}]`
      } else if ('Fn::Base64' in item) {
        result += `${spaces}- !Base64 '${item['Fn::Base64']}'`
      } else if ('Fn::Cidr' in item) {
        result += `${spaces}- !Cidr [${item['Fn::Cidr'].join(', ')}]`
      } else if ('Fn::Select' in item) {
        result += `${spaces}- !Select [${item['Fn::Select'].join(', ')}]`
      } else if ('Fn::Split' in item) {
        result += `${spaces}- !Split [${item['Fn::Split'].join(', ')}]`
      } else if ('Fn::Transform' in item) {
        result += `${spaces}- !Transform ${item['Fn::Transform']}`
      } else if ('Condition' in item) {
        result += `${spaces}- !Condition ${item['Condition']}`
      } else {
        // Create a new YAML document and stringify it
        const yamlStr = objectToYaml(item, indent + 2)
        // Ensure yamlStr is indented but not first line
        const indentedYamlStr = yamlStr.split('\n').map((line, index) => index === 0 ? line : `${spaces}  ${line}`).join('\n')
        result += `${spaces}- ${indentedYamlStr}`
      }
      result += isLastItem ? '' : '\n'
    } else {
      // Handle Multiline strings with newlines
      if (item && typeof item === 'string' && item.includes('\n')) {
        const indentedItem = item.split('\n').map((line) => `${spaces}  ${line}`).join('\n')
        result += `${spaces}- |\n${indentedItem}${isLastItem ? '' : '\n'}`
      } else {
        // Set string back to line
        result += `${spaces}- '${item}'${isLastItem ? '' : '\n'}`
      }
    }
  })

  return result
}

function objectToYaml(obj, indent = 0) {
  const doc = new YAML.Document()
  doc.contents = obj
  const yamlStr = doc.toString({
    indent: 2,
    lineWidth: -1,
    minContentWidth: 0,
    doubleQuotedAsJSON: true
  }).trim()
  return cleanValue(yamlStr)
}

module.exports = {
  arrayToYaml,
}
