import {
  Utils,
  HtmlElement,
  Display,
  WhiteSpace,
} from "./public-api";

let collapse_skip_tags = [
  "a",
  "(text)",
  "::before",
  "::after",
  "br",
  "ruby",
  "rp",
  "rb",
  "rt",
  "b",
  "strong",
];

export class MarginCollapse {
  static collapse(element: HtmlElement) {
    if (!this.isTarget(element)) {
      return;
    }
    // collapse between element.before <-> (prev-chains).after
    // prev-chains := prev, last of prev, last of last of prev ...
    let before = Utils.atoi(element.computedStyle.getPropertyValue("margin-before") || "0px");
    let prev_max = this.getMaxAfterOfBefore(element);
    let new_before = (prev_max >= before) ? 0 : before - prev_max;
    element.computedStyle.setProperty("margin-before", String(new_before) + "px");
    /*
      if(before !== new_before){
      console.log("[%s].marginBefore:%d->%d", element.toString(), before, new_before);
      }
    */

    // collapse between element.after <-> (parent-chains).after
    // parent-chains := parent, last of parent, last of last of parent ...
    let after = Utils.atoi(element.computedStyle.getPropertyValue("margin-after") || "0px");
    let parent_max = this.getMaxAfterOfParent(element);
    let new_after = (parent_max >= after) ? 0 : after - parent_max;
    element.computedStyle.setProperty("margin-after", String(new_after) + "px");
    /*
      if(after !== new_after){
      console.log("[%s].marginBefore:%d->%d", element.toString(), after, new_after);
      }
    */
  }

  static hasBorder(element: HtmlElement, dir: string): boolean {
    let prop = "border-" + dir + "-width";
    let value = element.computedStyle.getPropertyValue(prop) || "0px";
    let size = Utils.atoi(value, 10);
    return size > 0;
  }

  // previous,
  // last child of previous,
  // last child of last child of previous ....
  static getMaxAfterOfBefore(element: HtmlElement): number {
    if (this.hasBorder(element, "before")) {
      return 0;
    }
    let prev = element.previousSibling, max = 0;
    while (prev) { // prev -> last -> last ...
      if (WhiteSpace.isWhiteSpaceElement(prev)) {
        prev = prev.previousSibling;
        continue;
      }
      if (!this.isTarget(prev) || this.hasBorder(prev, "after")) {
        break;
      }
      let size = Utils.atoi(prev.computedStyle.getPropertyValue("margin-after") || "0px");
      if (size > max) {
        max = size;
      }
      prev = prev.lastChild;
      if (!prev) {
        break;
      }
    }
    return max;
  }

  // parent,
  // last child of parent
  // last child of lasts child of parent ...
  static getMaxAfterOfParent(element: HtmlElement): number {
    if (this.hasBorder(element, "after")) {
      return 0;
    }
    let parent = element.parent, max = 0;
    if (!parent || parent.lastChild !== element) {
      return 0;
    }
    while (parent) {
      if (!this.isTarget(parent)) {
        break;
      }
      let size = Utils.atoi(parent.computedStyle.getPropertyValue("margin-after") || "0px");
      if (size > max) {
        max = size;
      }
      if (!parent.parent) {
        break;
      }
      let last: HtmlElement | null = parent.parent.lastChild;
      if (last === null) {
        break;
      }
      // At this point, last is not null, but it's not recognized by typescript,
      // so we use 'last as HtmlElement'.
      while (WhiteSpace.isWhiteSpaceElement(last as HtmlElement)) {
        last = last.previousSibling;
        if (last === null) {
          break;
        }
      }
      if (parent !== last) {
        break;
      }
      parent = parent.parent;
    }
    return max;
  }

  static isTarget(element: HtmlElement): boolean {
    if (element.parent === null) { // root element
      return false;
    }
    if (element.isTextElement()) {
      return false;
    }
    if (collapse_skip_tags.indexOf(element.tagName) >= 0) {
      return false;
    }
    let float = element.computedStyle.getPropertyValue("float") || "none";
    if (float !== "none") {
      return false;
    }
    let display = Display.load(element);
    if (display.isBlockLevel() === false) {
      return false;
    }
    return true;
  }
}
