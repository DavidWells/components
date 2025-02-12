/**
 * CloudFormation Intrinsic Functions
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference.html
 */
const TAGS = [
  // Basic Functions
  '!Ref',              // References resources and parameters
  '!Sub',              // Substitutes variables in strings
  '!GetAtt',           // Gets attribute values from resources
  '!Join',             // Joins values with a delimiter
  '!Select',           // Selects a value from a list
  '!Split',            // Splits a string into a list
  '!ImportValue',      // Imports values from other stacks

  // Condition Functions
  '!And',              // Returns true if all conditions are true
  '!Equals',           // Returns true if two values are equal
  '!If',               // Returns one value if condition is true, another if false
  '!Not',              // Returns true if condition is false
  '!Or',               // Returns true if any condition is true
  '!Condition',        // References a condition

  // Transform Functions
  '!Transform',        // Processes template through macros
  '!Base64',           // Converts string to base64
  '!Cidr',             // Returns CIDR address blocks

  // Advanced Functions
  '!FindInMap',        // Returns value from a mapping
  '!GetAZs',           // Returns availability zones
  '!ToJsonString',     // Converts value to JSON string
]

const TAG_KEYS = TAGS.map((tag) => tag.slice(1))

const ALL_TAGS_OR_REGEX_PATTERN = TAG_KEYS.join('|')

// Group tags by type for easier reference
const TAG_GROUPS = {
  BASIC: ['!Ref', '!Sub', '!GetAtt', '!Join', '!Select', '!Split', '!ImportValue'],
  CONDITION: ['!And', '!Equals', '!If', '!Not', '!Or', '!Condition'],
  TRANSFORM: ['!Transform', '!Base64', '!Cidr'],
  ADVANCED: ['!FindInMap', '!GetAZs', '!ToJsonString']
}

module.exports = {
  TAGS,
  ALL_TAGS_OR_REGEX_PATTERN,
  TAG_GROUPS,
}
