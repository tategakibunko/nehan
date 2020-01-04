import {
  BoxType,
  Utils,
  DefaultCss,
  HtmlElement,
  CssCascade,
  CssLoader,
  LogicalFloat,
  Position,
} from "./public-api";

export enum DisplayOutside {
  BLOCK = "block",
  INLINE = "inline",
  RUN_IN = "run-in"
}

export enum DisplayInside {
  FLOW = "flow",
  FLOW_ROOT = "flow-root",
  TABLE = "table",
  FLEX = "flex",
  GRID = "grid",
  RUBY = "ruby"
}

export enum DisplayListItem {
  LIST_ITEM = "list-item"
}

export enum DisplayInternal {
  TABLE_ROW_GROUP = "table-row-group",
  TABLE_HEADER_GROUP = "table-header-group",
  TABLE_FOOTER_GROUP = "table-footer-group",
  TABLE_ROW = "table-row",
  TABLE_CELL = "table-cell",
  TABLE_COLUMN_GROUP = "table-column-group",
  TABLE_COLUMN = "table-column",
  TABLE_CAPTION = "table-caption",
  RUBY_BASE = "ruby-base",
  RUBY_TEXT = "ruby-text",
  RUBY_BASE_CONTAINER = "ruby-base-container",
  RUBY_TEXT_CONTAINER = "ruby-text-container"
}

export enum DisplayBox {
  NONE = "none",
  CONTENTS = "contents"
}

// keywords
export enum DisplayValue {
  NONE = "none",                         // none
  CONTENTS = "contents",                 // contents
  BLOCK = "block",                       // block flow
  INLINE = "inline",                     // inline flow
  INLINE_BLOCK = "inline-block",         // inline flow-root
  FLOW_ROOT = "flow-root",               // block flow-root
  RUN_IN = "run-in",                     // run-in flow
  LIST_ITEM = "list-item",               // block flow list-item
  INLINE_LIST_ITEM = "inline-list-item", // inline flow list-item
  FLEX = "flex",                         // block flex
  INLINE_FLEX = "inline-flex",           // inline flex
  GRID = "grid",                         // block grid
  INLINE_GRID = "inline-grid",           // inline grid
  RUBY = "ruby",                         // inline ruby
  BLOCK_RUBY = "block-ruby",             // block ruby
  TABLE = "table",                       // block table
  INLINE_TABLE = "inline-table",         // inline table
}

export class Display {
  public value: string;
  public outside?: string;
  public inside?: string;
  public internal?: string;
  public listItem?: string;
  public box?: string;

  static values: string[] = Utils.Enum.toValueArray(DisplayValue);
  static listItemValues: string[] = Utils.Enum.toValueArray(DisplayListItem);
  static internalValues: string[] = Utils.Enum.toValueArray(DisplayInternal);
  static boxValues: string[] = Utils.Enum.toValueArray(DisplayBox);
  static allValues: string[] = Display.values
    .concat(Display.listItemValues)
    .concat(Display.internalValues)
    .concat(Display.boxValues);

  constructor(value: DisplayValue) {
    if (Display.internalValues.includes(value)) {
      this.internal = value;
    }
    if (Display.listItemValues.includes(value)) {
      this.listItem = value;
    }
    if (Display.boxValues.includes(value)) {
      this.box = value;
    }
    this.value = DefaultCss.selectOrDefault("display", value, Display.allValues);

    switch (this.value) {
      case DisplayValue.NONE:
        this.box = DisplayBox.NONE;
        break;

      case DisplayValue.CONTENTS:
        this.box = DisplayBox.CONTENTS;
        break;

      case DisplayValue.BLOCK: // block flow
        this.outside = DisplayOutside.BLOCK;
        this.inside = DisplayInside.FLOW;
        break;

      case DisplayValue.INLINE_BLOCK: // inline flow-root
        this.outside = DisplayOutside.INLINE;
        this.inside = DisplayInside.FLOW_ROOT;
        break;

      case DisplayValue.FLOW_ROOT: // block flow-root
        this.outside = DisplayOutside.BLOCK;
        this.inside = DisplayInside.FLOW_ROOT;
        break;

      case DisplayValue.LIST_ITEM: // block flow list-item
        this.outside = DisplayOutside.BLOCK;
        this.inside = DisplayInside.FLOW;
        this.listItem = DisplayListItem.LIST_ITEM;
        break;

      case DisplayValue.INLINE_LIST_ITEM: // inline flow list-item
        this.outside = DisplayOutside.INLINE;
        this.inside = DisplayInside.FLOW;
        this.listItem = DisplayListItem.LIST_ITEM;
        break;

      case DisplayValue.RUN_IN: // run-in flow
        this.outside = DisplayOutside.RUN_IN;
        this.inside = DisplayInside.FLOW;
        break;

      case DisplayValue.FLEX: // block flex
        this.outside = DisplayOutside.BLOCK;
        this.inside = DisplayInside.FLEX;
        break;

      case DisplayValue.INLINE_FLEX: // inline flex
        this.outside = DisplayOutside.INLINE;
        this.inside = DisplayInside.FLEX;
        break;

      case DisplayValue.GRID: // block grid
        this.outside = DisplayOutside.BLOCK;
        this.inside = DisplayInside.GRID;
        break;

      case DisplayValue.INLINE_GRID: // inline grid
        this.outside = DisplayOutside.INLINE;
        this.inside = DisplayInside.GRID;
        break;

      case DisplayValue.BLOCK_RUBY: // block ruby
        this.outside = DisplayOutside.BLOCK;
        this.inside = DisplayInside.RUBY;
        break;

      case DisplayValue.RUBY: // inline ruby
        this.outside = DisplayOutside.INLINE;
        this.inside = DisplayInside.RUBY;
        break;

      case DisplayValue.TABLE: // block table
        this.outside = DisplayOutside.BLOCK;
        this.inside = DisplayInside.TABLE;
        break;

      case DisplayValue.INLINE_TABLE: // inline table
        this.outside = DisplayOutside.INLINE;
        this.inside = DisplayInside.TABLE;
        break;

      case DisplayInternal.TABLE_ROW_GROUP:
      case DisplayInternal.TABLE_HEADER_GROUP:
      case DisplayInternal.TABLE_FOOTER_GROUP:
      case DisplayInternal.TABLE_ROW:
        this.outside = DisplayOutside.BLOCK;
        this.inside = DisplayInside.FLOW;
        break;

      case DisplayInternal.TABLE_CELL:
        this.outside = DisplayOutside.INLINE;
        this.inside = DisplayInside.FLOW_ROOT;
        break;

      case DisplayValue.INLINE: // inline flow
      default:
        this.outside = DisplayOutside.INLINE;
        this.inside = DisplayInside.FLOW;
        break;
    }
  }

  static load(element: HtmlElement): Display {
    const value = CssCascade.getValue(element, "display");
    const display = new Display(value as DisplayValue);
    const float = LogicalFloat.load(element);
    const position = Position.load(element);
    if (!float.isNone() || position.isAbsolute() || position.isFixed()) {
      display.setFlowRoot();
    }
    // display of <a> is dynamically decided by it's content.
    if (element.tagName === "a") {
      return Display.loadDynamicDisplay(element, display);
    }
    return display;
  }

  static loadDynamicDisplay(element: HtmlElement, initValue: Display): Display {
    const firstElement = element.firstElementChild;
    if (!firstElement) {
      return initValue;
    }
    CssLoader.load(firstElement);
    return Display.load(firstElement);
  }

  public setBlockLevel() {
    this.outside = DisplayOutside.BLOCK;
  }

  public setFlowRoot() {
    this.inside = DisplayInside.FLOW_ROOT;
  }

  public toString(): string {
    return this.value;
  }

  public isNone(): boolean {
    return this.box ? this.box === DisplayBox.NONE : false;
  }

  public isContents(): boolean {
    return this.box ? this.box === DisplayBox.CONTENTS : false;
  }

  public isListItem(): boolean {
    return this.listItem ? true : false;
  }

  public isTable(): boolean {
    return this.inside ? this.inside === DisplayInside.TABLE : false;
  }

  public isTableRowGroup(): boolean {
    if (!this.internal) {
      return false;
    }
    switch (this.internal) {
      case DisplayInternal.TABLE_ROW_GROUP:
      case DisplayInternal.TABLE_HEADER_GROUP:
      case DisplayInternal.TABLE_FOOTER_GROUP:
        return true;
    }
    return false;
  }

  public isTableRow(): boolean {
    return this.internal ? this.internal === DisplayInternal.TABLE_ROW : false;
  }

  public isTableCell(): boolean {
    return this.internal ? this.internal === DisplayInternal.TABLE_CELL : false;
  }

  public isRubyChild(): boolean {
    return this.isRubyBase() || this.isRubyText();
  }

  public isRubyBase(): boolean {
    return this.internal ? this.internal === DisplayInternal.RUBY_BASE : false;
  }

  public isRubyText(): boolean {
    return this.internal ? this.internal === DisplayInternal.RUBY_TEXT : false;
  }

  public isFlow(): boolean {
    return this.isFlowInside() || this.isFlowRoot();
  }

  // diplay:inline flow
  public isInlineFlow(): boolean {
    return this.isInlineLevel() && this.isFlowInside();
  }

  // diplay:block flow
  public isBlockFlow(): boolean {
    return this.isBlockLevel() && this.isFlowInside();
  }

  // diplay:inline flow-root
  public isInlineBlockFlow(): boolean {
    return this.isInlineLevel() && this.isFlowRoot();
  }

  public isFlowInside(): boolean {
    return this.inside ? this.inside === DisplayInside.FLOW : false;
  }

  public isFlowRoot(): boolean {
    return this.inside ? this.inside === DisplayInside.FLOW_ROOT : false;
  }

  public isFlowTable(): boolean {
    return this.inside ? this.inside === DisplayInside.TABLE : false;
  }

  public isFlowRuby(): boolean {
    return this.inside ? this.inside === DisplayInside.RUBY : false;
  }

  public isBlockLevel(): boolean {
    return this.outside ? this.outside === DisplayOutside.BLOCK : false;
  }

  public isInlineLevel(): boolean {
    return this.outside ? this.outside === DisplayOutside.INLINE : false;
  }

  public get boxType(): BoxType {
    if (this.isInlineFlow()) {
      return BoxType.INLINE;
    }
    if (this.isInlineBlockFlow()) {
      return BoxType.INLINE_BLOCK;
    }
    return BoxType.BLOCK;
  }
}
