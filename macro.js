const { createMacro, MacroError } = require("babel-plugin-macros");
const { addNamed } = require("@babel/helper-module-imports");
const minify = require("./minify");

const annotateAsPure = require("@babel/helper-annotate-as-pure").default;

module.exports = createMacro(gooberMacro);

/**
 * @param {import("babel-plugin-macros").MacroParams} param0
 */
function gooberMacro({ references, babel, state }) {
  if (references.default) {
    throw new MacroError("goober.macro does not support default import");
  }

  let liteImport = null;
  let cssImport = null;
  let pragmaImport = null;

  const t = babel.types;

  function getLiteHelpers() {
    if (!liteImport) {
      liteImport = addNamed(program, "createStyled", "goober.macro/styled");
    }
    if (!cssImport) {
      cssImport = addNamed(program, "css", "goober");
    }
    return { lite: liteImport, css: cssImport, t: t };
  }

  const program = state.file.path;
  // Inject import {...} from 'goober'
  Object.keys(references).forEach(refName => {
    const id = addNamed(program, refName, "goober");
    if (refName === "css") {
      cssImport = id;
    }
    if (refName === "setPragma") {
      pragmaImport = addNamed(program, refName, "goober.macro/styled");
    }
    references[refName].forEach(referencePath => {
      referencePath.node.name = id.name;
    });
  });

  const pragmaReferences = references.setPragma || [];

  pragmaReferences.forEach(({ parentPath }) => {
    if (parentPath.type === "CallExpression") {
      const pragmaStatement = t.callExpression(
        t.identifier(pragmaImport.name),
        parentPath.node.arguments
      );
      parentPath.getStatementParent().insertAfter(pragmaStatement);
    }
  });

  const styledReferences = references.styled || [];

  styledReferences.forEach(({ parentPath }) => {
    const type = parentPath.type;

    if (type === "MemberExpression") {
      const node = parentPath.node;
      const functionName = node.object.name;
      let elementName = node.property.name;

      // Custom elements
      if (/[A-Z]/.test(elementName)) {
        elementName = elementName.replace(/[A-Z]/g, "-$&").toLowerCase();
      }

      // replace styled.* with styled("*")
      parentPath.replaceWith(
        t.callExpression(t.identifier(functionName), [
          t.stringLiteral(elementName)
        ])
      );
    }
    minimizeTemplate(parentPath.parent);
    annotateAsPure(parentPath.parent);
    replaceWithLite(parentPath, getLiteHelpers);
  });

  const cssReferences = references.css || [];
  const globReferences = references.glob || [];

  cssReferences.forEach(ref => {
    minimizeTemplate(ref.parent);
    annotateAsPure(ref.parentPath);
  });

  globReferences.forEach(ref => {
    minimizeTemplate(ref.parent);
    // glob is side-effect
  });
}

/**
 * @param {import("@babel/types").Node} node
 */
function minimizeTemplate(node) {
  if (node.type === "TaggedTemplateExpression") {
    minify(node.quasi);
  }
}

/**
 *
 * @param {import("@babel/traverse").NodePath<import("@babel/types").Node>} nodePath
 * @param {typeof import("@babel/core").types} t
 */
function replaceWithLite(nodePath, getLiteHelpers) {
  let shouldReplace = false;
  /**
   * @type {import("@babel/types").TemplateLiteral}
   */
  let quasi;

  let node = nodePath.parent;

  if (node.type === "TaggedTemplateExpression") {
    const quasisLength = node.quasi.quasis.length;
    shouldReplace = quasisLength === 1;
    quasi = node.quasi;
  }

  if (!shouldReplace) return;

  if (nodePath.type === "CallExpression") {
    const helpers = getLiteHelpers();
    /**
     * @type {typeof import("@babel/core").types}
     */
    const t = helpers.t;
    const cssImport = helpers.css;
    const liteImport = helpers.lite;
    let a = t.taggedTemplateExpression(t.identifier(cssImport.name), quasi);

    const liteFnImport = t.callExpression(t.identifier(liteImport.name), [
      nodePath.node.arguments[0],
      a
    ]);

    nodePath.parentPath.replaceWith(liteFnImport);
  }
}
