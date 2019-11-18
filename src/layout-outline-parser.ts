import {
  LayoutSection,
  LayoutOutlineCallbacks
} from "./public-api";

export class LayoutOutlineParser {
  static parseSection(section: LayoutSection, callbacks?: LayoutOutlineCallbacks): HTMLElement {
    callbacks = callbacks || {};
    if (section.isRoot()) {
      return this.parseSectionRoot(section, callbacks);
    }
    if (section.isNode()) {
      return this.parseSectionNode(section, callbacks);
    }
    return this.parseSectionLeaf(section, callbacks);
  }

  static parseSectionRoot(section: LayoutSection, callbacks: LayoutOutlineCallbacks): HTMLElement {
    let root = callbacks.onRoot ?
      callbacks.onRoot() :
      document.createElement("ul");
    this.appendSectionChildren(root, section.children, callbacks);
    return root;
  }

  static parseSectionNode(section: LayoutSection, callbacks: LayoutOutlineCallbacks): HTMLElement {
    let li = document.createElement("li");
    let ul = document.createElement("ul");
    let title = callbacks.onSection ?
      callbacks.onSection(section) :
      document.createTextNode(section.title);
    li.appendChild(title);
    this.appendSectionChildren(ul, section.children, callbacks);
    li.appendChild(ul);
    return li;
  }

  static parseSectionLeaf(section: LayoutSection, callbacks: LayoutOutlineCallbacks): HTMLElement {
    let li = document.createElement("li");
    let title = callbacks.onSection ?
      callbacks.onSection(section) :
      document.createTextNode(section.title);
    li.appendChild(title);
    return li;
  }

  static appendSectionChildren(
    parent: HTMLElement, children: LayoutSection[], callbacks: LayoutOutlineCallbacks) {
    children.forEach(child => {
      parent.appendChild(this.parseSection(child, callbacks));
    });
  }
}
