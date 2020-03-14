import {
  LayoutSection,
} from "./public-api";

export interface ILayoutOutlineEvaluator {
  visitSectionRoot: (section: LayoutSection) => HTMLElement;
  visitSectionNode: (section: LayoutSection) => HTMLElement;
  visitSectionLeaf: (section: LayoutSection) => HTMLElement;
}

export class LayoutOutlineEvaluator {
  constructor(private createTitle?: (section: LayoutSection) => HTMLElement | Node) { }

  visitSectionRoot(section: LayoutSection): HTMLElement {
    const root = document.createElement("ul");
    return this.visitSectionChildren(section.children, root);
  }

  visitSectionNode(section: LayoutSection): HTMLElement {
    const li = document.createElement("li");
    const title = this.createTitle ? this.createTitle(section) : document.createTextNode(section.title);
    li.appendChild(title);
    const ul = this.visitSectionChildren(section.children);
    li.appendChild(ul);
    return li;
  }

  visitSectionLeaf(section: LayoutSection): HTMLElement {
    const li = document.createElement("li");
    const title = this.createTitle ? this.createTitle(section) : document.createTextNode(section.title);
    li.appendChild(title);
    return li;
  }

  private visitSectionChildren(children: LayoutSection[], parent?: HTMLElement): HTMLElement {
    const ul = parent || document.createElement("ul");
    children.forEach(child => {
      if (child.isRoot()) {
        ul.appendChild(this.visitSectionRoot(child))
      } else if (child.isNode()) {
        ul.appendChild(this.visitSectionNode(child))
      } else {
        ul.appendChild(this.visitSectionLeaf(child))
      }
    });
    return ul;
  }
}
