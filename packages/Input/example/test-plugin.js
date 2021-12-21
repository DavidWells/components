// https://github.com/vslinko/babel-plugin-react-require/blob/master/src/index.js
// https://github.com/PavelDymkov/babel-plugin-auto-import
/* Default babel plugin */
module.exports = function ({ types: t }) {
  let containsJSX = false;
  return {
    visitor: {
      JSXOpeningElement() {
        containsJSX = true;
      },
      ClassDeclaration(classPath) {
        if (classPath.node.superClass) {
          return;
        }
        if (checkIfClassHasReactRender(classPath.node)) {
          containsJSX = true;
          classPath.node.superClass = t.identifier('Component')
        }
      },
      Program: {
        exit(path) {
          if (path.scope.hasBinding('React')) {
            console.log('Has react')
          }
          if (path.scope.hasBinding('styles')) {
            console.log('Has styles')
          }
          if (!containsJSX || path.scope.hasBinding('React')) {
            return;
          }

          const reactImport = t.importDeclaration([
            t.importDefaultSpecifier(t.identifier('React')),
            t.importSpecifier(t.identifier('Component'), t.identifier('Component')),
            t.importSpecifier(t.identifier('PropTypes'), t.identifier('PropTypes'))
          ], t.stringLiteral('react'));

          path.node.body.unshift(reactImport);
        },
      },
    },
  };
}

/*
 * Checks if the the class contains React's render
 * method and if it returns a JSX element.
 */
function checkIfClassHasReactRender(currentClass) {
  try {
    const getRenderMethod = currentClass.body.body.filter(id => id.type === 'ClassMethod' && id.key.name === 'render');
    return getRenderMethod[0].body.body.filter(child => child.type === 'ReturnStatement').map(stat => stat.argument.type)[0] === 'JSXElement';
  } catch (e) {
    return false;
  }
}
