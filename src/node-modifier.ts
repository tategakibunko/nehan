import {
  HtmlElement,
  Display,
} from './public-api'

export interface NodeModifier {
  visit: (element: HtmlElement) => HtmlElement;
}

/*
  # sweep out block from inline

  <div>
    <span>
      text1
      <p>foo</p>
      text2
      <p>bar</p>
      text3
    </span>
  </div>

  =>

  <div>
    <span>text1</span>
    <p>foo</p>
    <span>text2</span>
    <p>bar</p>
    <span>text3</span>
  </div>
*/
export class InvalidBlockSweeper implements NodeModifier {
  visit(element: HtmlElement): HtmlElement {
    const children = element.childNodes;
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i];
      if (Display.load(child).isBlockLevel() && element.parent) {
        const next = element.nextSibling;
        const headChildren = children.slice(0, i);
        const restChildren = children.slice(i + 1);
        element.childNodes = headChildren;
        element.parent.insertBefore(child, next);
        let restNode = element.clone();
        restNode.parent = element.parent;
        restChildren.forEach(child => restNode.appendChild(child));
        restNode = this.visit(restNode);
        element.parent.insertBefore(restNode, next);
        break;
      }
    }
    return element;
  }
}

// TODO
// optimize element order of float element.
// (inline+ float) -> (float inline+)
class FloatOptimizer implements NodeModifier {
  visit(element: HtmlElement): HtmlElement {
    return element;
  }
}
