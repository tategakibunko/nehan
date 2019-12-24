import {
  Utils,
  HtmlElement,
  ListStyle,
  SpaceChar,
} from "./public-api";

export enum PseudoElementTagName {
  MARKER = "::marker",
  BEFORE = "::before",
  AFTER = "::after",
  FIRST_LINE = "::first-line",
  FIRST_LETTER = "::first-letter"
}

export const PseudoElementTagNames = Utils.Enum.toValueArray(PseudoElementTagName);

export class PseudoElement {
  static isPseudoElement(element: HtmlElement): boolean {
    return element.tagName.substring(0, 2) === "::";
  }

  static isFirstLine(element: HtmlElement): boolean {
    return element.tagName === PseudoElementTagName.FIRST_LINE;
  }

  static findMarkerParent(element: HtmlElement): HtmlElement {
    let first_child = element.firstChild;
    if (!first_child || first_child.isTextElement()) {
      return element;
    }
    if (first_child.tagName === "img") {
      return element;
    }
    return this.findMarkerParent(first_child);
  }

  // Note that this function is called BEFORE defined-styles are set to element.style.
  static addMarker(element: HtmlElement): HtmlElement {
    // Even if li::marker is not defined in stylesheet,
    // list-item-context try to add marker element before layouting.
    // So if it's already inserted by css, just return it.
    if (element.firstChild && element.firstChild.tagName === PseudoElementTagName.MARKER) {
      return element.firstChild;
    }
    const list_style = ListStyle.load(element); // this value is inherited from parent(li).
    const index = element.indexOfType;
    const marker_element = element.root.createElement("::marker");
    let marker_text = list_style.getMarkerText(index);
    if (element.querySelectorAll("li").length > 0) {
      marker_text = SpaceChar.markerSpace;
    }
    const marker_parent = this.findMarkerParent(element);
    if (marker_parent.tagName === "::marker") {
      //console.warn("marker is already created");
      return marker_parent; // already created!
    }
    const marker_text_node = element.root.createTextNode(marker_text);
    marker_element.appendChild(marker_text_node);
    marker_element.parent = marker_parent;
    marker_parent.insertBefore(marker_element, marker_parent.firstChild);
    return marker_element;
  }

  static addBefore(element: HtmlElement): HtmlElement {
    const before = element.root.createElement(PseudoElementTagName.BEFORE);
    element.insertBefore(before, element.firstChild);
    return before;
  }

  static addAfter(element: HtmlElement): HtmlElement {
    const after = element.root.createElement(PseudoElementTagName.AFTER);
    element.appendChild(after);
    return after;
  }

  static addFirstLine(element: HtmlElement): HtmlElement | null {
    const first_line = element.root.createElement(PseudoElementTagName.FIRST_LINE);
    const first_text_node = element.firstTextElement;
    if (!first_text_node) {
      return null;
    }
    const target_parent = first_text_node.parent;
    if (!target_parent) {
      return null;
    }
    first_line.appendChild(first_text_node);
    target_parent.replaceChild(first_line, first_text_node);
    return first_line;
  }

  static addFirstLetter(element: HtmlElement): HtmlElement | null {
    const first_text_node = element.firstTextElement;
    if (!first_text_node) {
      return null;
    }
    const target_parent = first_text_node.parent;
    if (!target_parent) {
      return null;
    }
    const text = first_text_node.textContent;
    const trim_text = text.trim();
    const target_text = (trim_text.length > 1) ? trim_text : text;
    const first_text = target_text.substring(0, 1);
    const next_text = text.substring(1);
    const first_letter = element.root.createElement(PseudoElementTagName.FIRST_LETTER);
    first_letter.appendChild(element.root.createTextNode(first_text));
    const next_node = element.root.createTextNode(next_text);
    next_node.appendChild(element.root.createTextNode(next_text));
    const base_node = first_text_node.nextSibling;
    target_parent.removeChild(first_text_node);
    target_parent.insertBefore(next_node, base_node);
    target_parent.insertBefore(first_letter, next_node);
    return first_letter;
  }

  static addElement(element: HtmlElement, pe_tag_name: string): HtmlElement | null {
    switch (pe_tag_name) {
      case PseudoElementTagName.MARKER:
        return PseudoElement.addMarker(element);
      case PseudoElementTagName.BEFORE:
        return PseudoElement.addBefore(element);
      case PseudoElementTagName.AFTER:
        return PseudoElement.addAfter(element);
      case PseudoElementTagName.FIRST_LETTER:
        return PseudoElement.addFirstLetter(element);
      case PseudoElementTagName.FIRST_LINE:
        return PseudoElement.addFirstLine(element);
    }
    throw new Error("undefined pseudo element:" + pe_tag_name);
  }
}
