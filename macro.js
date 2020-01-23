const { createMacro, MacroError } = require("babel-plugin-macros");
const { addNamed } = require("@babel/helper-module-imports");
const minify = require("./minify");

const annotateAsPure = require("@babel/helper-annotate-as-pure").default;

module.exports = createMacro(gooberMacro);

function gooberMacro({ references, babel, state }) {
  if (references.default) {
    throw new MacroError("goober.macro does not support default import");
  }

  const program = state.file.path;
  // Inject import {...} from 'goober'
  Object.keys(references).forEach(refName => {
    const id = addNamed(program, refName, "goober");
    references[refName].forEach(referencePath => {
      referencePath.node.name = id.name;
    });
  });

  const t = babel.types;

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
      minimizeTemplate(parentPath.parent);
      annotateAsPure(parentPath.parent);
    }
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

function minimizeTemplate(node) {
  if (node.type === "TaggedTemplateExpression") {
    // func`css`
    minify(node.quasi);
  } else if (node.type === "CallExpression") {
    // func(`css`)
    node.arguments.forEach(arg => {
      if (arg.type === "TemplateLiteral") {
        minify(arg);
      }
    });
  }
}
