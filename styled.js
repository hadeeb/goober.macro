let h;
export function setPragma(_h) {
  h = _h;
}

export function createStyled(tag, generatedClass) {
  if (process.env.NODE_ENV !== "production" && !h) {
    throw new Error("Use setPragma from `goober.macro`");
  }

  function Styled(props) {
    const _props = Object.assign({}, props);
    const _previousClassName = _props.className;
    _props.className =
      generatedClass + (_previousClassName ? " " + _previousClassName : "");
    return h(tag, _props);
  }
  if (process.env.NODE_ENV !== "production") {
    let componentName;
    if (typeof tag === "string") {
      componentName = tag;
    } else {
      componentName = tag.displayName || tag.name || "Component";
    }
    Styled.displayName = "Styled" + componentName;
  }
  return Styled;
}
