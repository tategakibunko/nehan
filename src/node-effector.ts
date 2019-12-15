import {
  HtmlElement,
  Display,
  CssCascade,
  CssParser,
  CssBoxMeasure,
  CssBoxExtent,
  PseudoElement,
  DefaultStyle,
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
  visit(inlineElement: HtmlElement) {
    const nodes = inlineElement.childNodes;
    const nextNode = inlineElement.nextSibling;
    for (let i = 0; i < nodes.length; i++) {
      const child = nodes[i];
      if (Display.load(child).isBlockLevel() && inlineElement.parent) {
        const headNodes = nodes.slice(0, i);
        const tailNodes = nodes.slice(i + 1);
        inlineElement.childNodes = headNodes;
        inlineElement.parent.insertBefore(child, nextNode);
        const inlineElement2 = inlineElement.clone();
        inlineElement2.parent = inlineElement.parent;
        tailNodes.forEach(child => inlineElement2.appendChild(child));
        this.visit(inlineElement2);
        inlineElement.parent.insertBefore(inlineElement2, nextNode);
        break;
      }
    }
  }
}

/*
  [css setter]

  element
    .acceptNodeEffector(cssSpecifiedValueSetter)
    .acceptNodeEffector(cssDynamicValueSetter)
    .acceptNodeEffector(cssInlineValueSetter)
    .acceptNodeEffector(cssComputedValueSetter)
    .acceptNodeEffector(cssUsedValueSetter)
*/

// 1. Initialize specified value
export class SpecifiedValueSetter implements NodeEffector {
  visit(element: HtmlElement) {
    // pseudo element already get it's own styles while css matching.
    // See CssStyleSheet::getRulesOfElement in 'css-stylesheet.ts'
    if (element.isTextElement() || PseudoElement.isPseudoElement(element)) {
      return;
    }
    const specStyle = element.ownerDocument.specStyleSheet.getStyleOfElement(element);
    element.style = specStyle;
  }
}

// 2. set dynamic (specified) value
export class SpecifiedDynamicValueSetter implements NodeEffector {
  visit(element: HtmlElement) {
    const dynamicStyle = element.style.getDynamicStyle(element);
    element.style.mergeFrom(dynamicStyle);
  }
}

// 3. set inline (specified) value
export class SpecifiedInlineValueSetter implements NodeEffector {
  visit(element: HtmlElement) {
    const inlineStyleSrc = element.getAttribute("style") || "";
    const inlineStyle = CssParser.parseInlineStyle(inlineStyleSrc);
    element.style.mergeFrom(inlineStyle);
  }
}

// - measure(auto/percent/fiexed)
// - margin-start, margin-end(auto/percent/fixed)
export class CssComputedValueSetter implements NodeEffector {
  private setCascadedValue(element: HtmlElement, prop: string): string {
    let value = CssCascade.getValue(element, prop);
    element.computedStyle.setProperty(prop, value);
    return value;
  }

  private getMeasure(element: HtmlElement): number {
    const specValue = this.setCascadedValue(element, "measure");
    if (element.tagName === "body") {
      if (specValue === "" || specValue === "auto") {
        return parseInt(DefaultStyle.get("body", "measure"), 10);
      }
    }
    return new CssBoxMeasure(specValue).computeSize(element);
  }

  private getExtent(element: HtmlElement): number {
    const specValue = this.setCascadedValue(element, "extent");
    if (element.tagName === "body") {
      if (specValue === "" || specValue === "auto") {
        return parseInt(DefaultStyle.get("body", "extent"), 10);
      }
    }
    return new CssBoxExtent(specValue).computeSize(element);
  }

  private setMeasure(element: HtmlElement): number {
    const measure = this.getMeasure(element);
    element.computedStyle.setProperty("measure", String(measure));
    return measure;
  }

  visit(element: HtmlElement) {
    const display = this.setCascadedValue(element, "display");
    if (display === 'none') {
      return;
    }
    const measure = this.setMeasure(element);
  }
}

// TODO
// optimize element order of float element.
// (inline+ float) -> (float inline+)
class FloatOptimizer implements NodeEffector {
  visit(element: HtmlElement) {
  }
}
