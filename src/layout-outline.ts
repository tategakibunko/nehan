import {
  HtmlElement,
  LayoutSection,
  LayoutOutlineCallbacks,
  LayoutOutlineParser,
  FlowContext,
  Anchor,
  Utils,
} from "./public-api";

export class LayoutOutline {
  public rootElement?: HtmlElement;
  public rootSection: LayoutSection;
  public curSection: LayoutSection;
  public anchor: { [anchor_name: string]: Anchor };

  constructor() {
    this.rootSection = new LayoutSection();
    this.curSection = this.rootSection;
    this.anchor = {};
  }

  public createElement(callbacks?: LayoutOutlineCallbacks): HTMLElement {
    //console.log("createElement:", this.rootSection);
    return LayoutOutlineParser.parseSection(this.rootSection, callbacks);
  }

  public openElement(context: FlowContext, element: HtmlElement): LayoutSection | undefined {
    if (LayoutSection.isSectioningRootElement(element)) {
      return this.openSectionRoot(context, element);
    }
    if (LayoutSection.isSectioningElement(element)) {
      return this.openSection(context, element);
    }
    if (LayoutSection.isHeaderElement(element)) {
      return this.openHeader(context, element);
    }
    if (element.tagName === "a") {
      let anchor_name = element.getAttribute("name") || "";
      if (anchor_name) {
        this.addAnchor(context, element, anchor_name);
      }
    }
    return undefined;
  }

  public getAnchor(anchor_name: string): Anchor | null {
    return this.anchor[anchor_name] || null;
  }

  public openSectionRoot(context: FlowContext, element: HtmlElement): LayoutSection {
    //console.log("openSectionRoot:", element.tagName);
    if (!this.rootElement) {
      return this.curSection;
    }
    this.rootElement = element;
    //console.log("set section root:", element.tagName);
    return this.openSection(context, element);
  }

  public openSection(context: FlowContext, element: HtmlElement): LayoutSection {
    // <sect> <- cur(already closed)
    //   content
    // </sect>
    // <sect> <- next!
    if (this.curSection.closed) {
      this.curSection = this.createNextSection(context);
    }
    // <sect> <- cur(still open)
    //   content
    //   <sect> <- sub!
    else {
      this.curSection = this.createSubSection(context);
    }
    return this.curSection;
  }

  public closeSection(context: FlowContext, element?: HtmlElement): LayoutSection {
    if (element && LayoutSection.isSectioningElement(element) === false) {
      return this.curSection;
    }
    //let before = this.curTitle;
    if (this.curSection.parent) {
      this.curSection = this.curSection.parent;
    }
    //console.log("closeSection: %s -> %s", before, this.curTitle);
    return this.curSection;
  }

  protected addAnchor(context: FlowContext, element: HtmlElement, anchor_name: string) {
    this.anchor[anchor_name] = {
      name: anchor_name,
      pageIndex: context.bodyPageIndex
    };
  }

  protected openHeader(context: FlowContext, element: HtmlElement): LayoutSection {
    this.curSection = this.addHeader(context, element);
    return this.curSection;
  }

  protected get curTitle(): string {
    let close_state = this.curSection.closed ? "(closed)" : "(open)";
    return this.curSection.title + close_state;
  }

  protected createContextSection(context: FlowContext, header?: HtmlElement): LayoutSection {
    let section = new LayoutSection(header);
    section.pageIndex = context.bodyPageIndex;
    return section;
  }

  protected createStandAloneSubSection(context: FlowContext, header?: HtmlElement):
    LayoutSection {
    let section = this.createContextSection(context, header);
    section.closed = true; // stand alone
    this.curSection.addChild(section);
    //console.log("[%s] create stand alone sub section:%s", this.curTitle, section.title);
    return section;
  }

  protected createSubSection(context: FlowContext, header?: HtmlElement): LayoutSection {
    //let section = new LayoutSection(header);
    let section = this.createContextSection(context, header);
    this.curSection.addChild(section);
    //console.log("[%s] create sub section:%s", this.curTitle, section.title);
    return section;
  }

  protected createNextSection(context: FlowContext, header?: HtmlElement): LayoutSection {
    //let section = new LayoutSection(header);
    let section = this.createContextSection(context, header);
    let root_section = this.closeSection(context);
    root_section.addChild(section);
    //console.log("[%s] create next section:%s", this.curTitle, section.title);
    return section;
  }

  protected closeHigherSection(section: LayoutSection, max_level: number): LayoutSection {
    if (!section.parent || !section.parent.parent || section.level <= max_level) {
      return section;
    }
    section.closed = true;
    return this.closeHigherSection(section.parent, max_level);
  }

  protected createHigherSection(context: FlowContext, header: HtmlElement, max_level: number):
    LayoutSection {
    //console.log("createHigherSection: %s, dst level:%d", header.textContent, max_level); 
    if (this.curSection.parent) {
      this.curSection = this.closeHigherSection(this.curSection.parent, max_level);
    }
    return this.createNextSection(context, header);
  }

  protected addHeader(context: FlowContext, header: HtmlElement): LayoutSection {
    //console.log("[%s] addHeader(%s):%s", this.curTitle, header.tagName, header.textContent);
    if (!this.curSection.header) { // header is not set yet
      if (!this.curSection.parent) { // root section
        //console.log("[%s] accepted first header", this.curTitle);
        return this.createSubSection(context, header); // create sub section with header
      }
      this.curSection.setHeader(header);
      return this.curSection;
    }
    let cur_level = this.curSection.level;
    let new_level = Utils.getHeaderLevel(header);
    //console.log("[%s] h%d -> h%d", this.curTitle, cur_level, new_level);
    if (new_level > cur_level) { // lower level makes stand alone sub section.
      return this.createStandAloneSubSection(context, header);
    }
    if (new_level === cur_level) { // same level makes continuous section.
      return this.createNextSection(context, header);
    }
    this.curSection.closed = true;

    // higher level close current section and create new section.
    return this.createHigherSection(context, header, new_level);
  }
}
