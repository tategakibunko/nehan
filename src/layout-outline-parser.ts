import {
  LayoutSection,
  LayoutOutlineCallbacks
} from "./public-api";

export class LayoutOutlineParser {
  static parseSection(section: LayoutSection, callbacks?: LayoutOutlineCallbacks): HTMLElement {
    callbacks = callbacks || {};
    if(!section.parent){
      return this.parseSectionRoot(section, callbacks);
    }
    return this.parseSubSection(section, callbacks);
  }

  static parseSectionRoot(section: LayoutSection, callbacks: LayoutOutlineCallbacks): HTMLElement {
    let root = callbacks.onRoot?
      callbacks.onRoot() :
      document.createElement("div");
    this.appendSectionChildren(root, section.children, callbacks);
    return root;
  }

  static parseSubSection(section: LayoutSection, callbacks: LayoutOutlineCallbacks): HTMLElement {
    let ul = document.createElement("ul");
    let li = document.createElement("li");
    let title = callbacks.onSection?
      callbacks.onSection(section) :
      document.createTextNode(section.title);
    li.appendChild(title);
    this.appendSectionChildren(li, section.children, callbacks);
    ul.appendChild(li);
    return ul;
  }

  static appendSectionChildren(
    parent: HTMLElement, children: LayoutSection [], callbacks: LayoutOutlineCallbacks) {
    children.forEach(child => {
      parent.appendChild(this.parseSection(child, callbacks));
    });
  }
}
