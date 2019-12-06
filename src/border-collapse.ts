import {
  HtmlElement,
  Utils,
  DefaultCss,
  CssCascade
} from "./public-api";

export enum BorderCollapseValue {
  COLLAPSE = "collapse",
  SEPARATE = "separate",
}

let border_width = (element: HtmlElement, dir: string): number => {
  let value = element.computedStyle.getPropertyValue(`border-${dir}-width`) || "0";
  return Utils.atoi(value, 10);
}

let parent_border_width = (element: HtmlElement, dir: string): number => {
  let width = border_width(element, dir);
  if (width !== 0 || element.parent === null) {
    return width;
  }
  return parent_border_width(element.parent, dir);
}

export class BorderCollapse {
  public value: BorderCollapseValue;
  static values: BorderCollapseValue[] = Utils.Enum.toValueArray(BorderCollapseValue);

  constructor(value: BorderCollapseValue) {
    this.value = DefaultCss.selectOrDefault(
      "border-collapse", value, BorderCollapse.values
    ) as BorderCollapseValue;
  }

  public isCollapse(): boolean {
    return this.value === BorderCollapseValue.COLLAPSE;
  }

  public isSeparate(): boolean {
    return this.value === BorderCollapseValue.SEPARATE;
  }

  static load(element: HtmlElement) {
    let value = CssCascade.getValue(element, "border-collapse");
    return new BorderCollapse(value as BorderCollapseValue);
  }

  // If border-collapse is enabled,
  // all properties that may cause different border-width
  // between parent and child are disabled.
  static disableEdge(table: HtmlElement) {
    table.setAttribute("style", "padding:0");
    table.children.forEach(child => {
      this.disableEdgeChild(child);
    });
  }

  // padding of table-cell is not affected to border-size,
  // so if th or td, padding is not erased.
  static disableEdgeChild(child: HtmlElement) {
    if (child.tagName === "th" || child.tagName === "td") {
      child.style.setProperty("margin", "0");
      return;
    }
    // thead, tbody, tfoot, tr
    child.style.setProperty("margin", "0");
    child.style.setProperty("padding", "0");
    child.children.forEach(child => {
      this.disableEdgeChild(child);
    });
  }

  static collapse(table: HtmlElement) {
    let tgrp = table.firstElementChild;
    while (tgrp !== null) {
      let next = tgrp.nextElementSibling;
      this.collapseTableTgrp(table, tgrp);
      if (next !== null) {
        this.collapseBlockSibling(tgrp, next);
      }
      tgrp = next;
    }
  }

  static collapseTableTgrp(table: HtmlElement, tgrp: HtmlElement) {
    this.collapseParentChildBlock(table, tgrp);
    let tr = tgrp.firstElementChild;
    while (tr !== null) {
      let next = tr.nextElementSibling;
      this.collapseTgrpTr(tgrp, tr);
      if (next !== null) {
        this.collapseBlockSibling(tr, next);
      }
      tr = next;
    }
  }

  static collapseTgrpTr(tgrp: HtmlElement, tr: HtmlElement) {
    this.collapseParentChildBlock(tgrp, tr);
    let cell = tr.firstElementChild;
    while (cell !== null) {
      let next = cell.nextElementSibling;
      this.collapseTrCell(tr, cell);
      if (next !== null) {
        this.collapseInlineSibling(cell, next);
      }
      cell = next;
    }
  }

  static collapseTrCell(parent: HtmlElement, child: HtmlElement) {
    let parent_before = parent_border_width(parent, "before");
    let child_before = border_width(child, "before");
    if (parent_before > 0 && child_before > 0) {
      //console.log("collapse(%s).before", child.toString(true));
      child.computedStyle.setProperty("border-before-width", "0px");
    }
    let parent_after = parent_border_width(parent, "after");
    let child_after = border_width(child, "after");
    if (parent_after > 0 && child_after > 0) {
      //console.log("collapse(%s).after", child.toString(true));
      child.computedStyle.setProperty("border-after-width", "0px");
    }
    if (child.isFirstElementChild()) {
      let parent_start = parent_border_width(parent, "start");
      let child_start = border_width(child, "start");
      if (parent_start > 0 && child_start > 0) {
        //console.log("collapse(%s).start", child.toString(true));
        child.computedStyle.setProperty("border-start-width", "0px");
      }
    }
    if (child.isLastElementChild()) {
      let parent_end = parent_border_width(parent, "end");
      let child_end = border_width(child, "end");
      if (parent_end > 0 && child_end > 0) {
        //console.log("collapse(%s).end", child.toString(true));
        child.computedStyle.setProperty("border-end-width", "0px");
      }
    }
    // cell <-> table(child of cell)
    let first_child = child.firstElementChild;
    if (first_child && first_child.style.getPropertyValue("display") === "table") {
      first_child.computedStyle.setProperty("margin", "0");
      this.collapseParentChildBlock(child, first_child);
    }
  }

  static collapseParentChildBlock(parent: HtmlElement, child: HtmlElement) {
    let parent_start = parent_border_width(parent, "start");
    let child_start = border_width(child, "start");
    if (parent_start > 0 && child_start > 0) {
      //console.log("collapse(%s).start", child.toString(true));
      child.computedStyle.setProperty("border-start-width", "0px");
    }
    let parent_end = parent_border_width(parent, "end");
    let child_end = border_width(child, "end");
    if (parent_end > 0 && child_end > 0) {
      //console.log("collapse(%s).end", child.toString(true));
      child.computedStyle.setProperty("border-end-width", "0px");
    }
    if (child.isFirstElementChild()) {
      let parent_before = parent_border_width(parent, "before");
      let child_before = border_width(child, "before");
      if (parent_before > 0 && child_before > 0) {
        //console.log("collapse(%s).before", child.toString(true));
        child.computedStyle.setProperty("border-before-width", "0px");
      }
    }
    if (child.isLastElementChild()) {
      let parent_after = parent_border_width(parent, "after");
      let child_after = border_width(child, "after");
      if (parent_after > 0 && child_after > 0) {
        //console.log("collapse(%s).after", child.toString(true));
        child.computedStyle.setProperty("border-after-width", "0px");
      }
    }
  }

  static collapseBlockSibling(prev: HtmlElement, next: HtmlElement) {
    let prev_after = border_width(prev, "after");
    let next_before = border_width(next, "before");
    if (prev_after > 0 && next_before > 0) {
      //console.log("collapse(%s).before", next.toString(true));
      next.computedStyle.setProperty("border-before-width", "0px");
    }
  }

  static collapseInlineSibling(prev: HtmlElement, next: HtmlElement) {
    let prev_end = border_width(prev, "end");
    let next_start = border_width(next, "start");
    if (prev_end > 0 && next_start > 0) {
      //console.log("collapse(%s).start", next.toString(true));
      next.computedStyle.setProperty("border-start-width", "0px");
    }
  }
}
