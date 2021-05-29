var postcss = require('postcss');
var helpers = require('postcss-message-helpers');
var reduceFunctionCall = require('reduce-function-call');
var maths = require('mathjs');
var PREFIXES = maths.Unit.PREFIXES;
var BASE_UNITS = maths.Unit.BASE_UNITS;

// create a mathjs instance
const math = maths.create(maths.all)

var cssUnits = {
  PIXELS: 'px',
  EM: 'em',
  EX: 'ex',
  CH: 'ch',
  REM: 'rem',
  POINTS: 'pt',
  VH: 'vh',
  VW: 'vw',
  VMIN: 'vmin',
  VMAX: 'vmax'
};

Object.keys(cssUnits).forEach(function(unitKey) {
  BASE_UNITS[unitKey] = {
    dimensions: [0, 1, 0, 0, 0, 0, 0, 0, 0],
    key: unitKey
  };

  var unit = cssUnits[unitKey];

  math.Unit.UNITS[unit] = {
    name: unit,
    base: BASE_UNITS[unitKey],
    prefixes: PREFIXES.NONE,
    value: 1,
    offset: 0,
    dimensions: BASE_UNITS[unitKey].dimensions
  };
});

function strip(value) {
  return value.strip()
}

math.Unit.prototype.strip = function() {
  return this._denormalize(this.value);
};

math.import({
  strip: strip,
//   hello: function(name) {
//     return 'hello, ' + name + '!'
//   }
});

const parser = math.parser()

function transformResolve(value, functionName) {
  return reduceFunctionCall(value, functionName, function(argString) {

    // Remove linebreaks to prevent brackets in output
    argString = argString.replace(/(\r\n|\n|\r)/gm, ' ');

    var unit = '';
    if (argString.indexOf('floor(') >= 0 ||
      argString.indexOf('ceil(') >= 0) {
      // drop unit to apply floor or ceil function
      var start = argString.indexOf('(') + 1;
      var end = argString.indexOf(')');
      var numberWithUnit = argString.substring(start, end);


      var number = numberWithUnit.replace(
        /([^a-zA-Z]+)([a-zA-Z]*)$/, '$1'
      );
      unit = numberWithUnit.replace(/([^a-zA-Z]+)([a-zA-Z]*)$/, '$2');
      argString = argString.substring(0, start) + number + ')';
    }

    var res = math.evaluate(argString);
    // var res = parser.evaluate(argString);
    // Add previous splitted unit if any
    var formatted = res.toString() + unit;

    // Math.JS puts a space between numbers and units, drop it.
    formatted = formatted.replace(/(.+) ([a-zA-Z]+)$/, '$1$2');
    return formatted;
  });
}

module.exports = (opts = {}) => {
  opts = opts || {};

  var functionName = 'resolve';
  if (opts.functionName) {
    functionName = opts.functionName
  }

  return function(css) {
    // Transform CSS AST here
    css.walk(function(node) {
      var nodeProp;

      if (node.type === 'decl') {
        nodeProp = 'value';
      } else if (node.type === 'atrule' && node.name === 'media') {
        nodeProp = 'params';
      } else if (node.type === 'rule') {
        nodeProp = 'selector';
      } else {
        return;
      }

      var match = functionName + '(';
      if (!node[nodeProp] || node[nodeProp].indexOf(match) === -1) {
        return;
      }

      node[nodeProp] = helpers.try(function() {
        return transformResolve(node[nodeProp], functionName);
      }, node.source);
    })
  };
};