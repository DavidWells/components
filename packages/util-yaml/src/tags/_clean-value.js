
const { ALL_TAGS_OR_REGEX_PATTERN } = require('./_constants')

const TAG_IN_DOUBLE_QUOTES_REGEX = new RegExp(`"(!(${ALL_TAGS_OR_REGEX_PATTERN}) [^"]+)"`, 'g')
const TAG_IN_SINGLE_QUOTES_REGEX = new RegExp(`'(!(${ALL_TAGS_OR_REGEX_PATTERN}) [^']+)'`, 'g')
const ENSURE_SPACE_PREFIX = new RegExp(`([^\\s])(!(${ALL_TAGS_OR_REGEX_PATTERN}))`, 'g')

function cleanValue(value) {
  console.log('cleanValue', value)
  return value
    .replace(TAG_IN_DOUBLE_QUOTES_REGEX, '$1')
    .replace(TAG_IN_SINGLE_QUOTES_REGEX, '$1')
    /* Ensure space on comma for double quotes */
    .replace(/,([^\s])(?=(?:[^"]*"[^"]*")*[^"]*$)/gm, ', $1')
    /* Ensure space on comma for single quotes */
    .replace(/,([^\s])(?=(?:[^']*'[^']*')*[^']*$)/gm, ', $1')
    /* Ensure space on intrinsic function tag */
    .replace(ENSURE_SPACE_PREFIX, '$1 $2')
    /* ensure space after opening bracket on second item */
    .replace(/(['"]), \[(?!\s)(?=\S)/g, '$1, [ ')
    /* ensure space after closing bracket */
    .replace(/\](?![\s]|$)(?=\]+(\s+\])*$)/gm, '] ')
    /* ensure space last value and closing bracket */
    .replace(/(\S)(\](\s+\])+)[ \t]*$/m, '$1 $2')
}

module.exports = {
  cleanValue,
}
