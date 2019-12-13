import {
  HtmlElement,
  Display,
} from './public-api'

// treat side-effect
export interface NodeEffector {
  visit: (element: HtmlElement) => void;
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
export class InvalidBlockSweeper implements NodeEffector {
  visit(element: HtmlElement) {
    const nodes = element.childNodes;
    for (let i = 0; i < nodes.length; i++) {
      const child = nodes[i];
      if (Display.load(child).isBlockLevel() && element.parent) {
        const next = element.nextSibling;
        const headNodes = nodes.slice(0, i);
        const tailNodes = nodes.slice(i + 1);
        element.childNodes = headNodes;
        element.parent.insertBefore(child, next);
        let restNode = element.clone();
        restNode.parent = element.parent;
        tailNodes.forEach(child => restNode.appendChild(child));
        this.visit(restNode);
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
class FloatOptimizer implements NodeEffector {
  visit(element: HtmlElement) {
  }
}
