import {
  HtmlElement,
  LayoutSection,
  LayoutOutlineCallbacks,
  LayoutOutlineParser,
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

  public openElement(element: HtmlElement, pageIndex: number): LayoutSection | undefined {
    if (LayoutSection.isSectioningRootElement(element)) {
      return this.openSectionRoot(element, pageIndex);
    }
    if (LayoutSection.isSectioningElement(element)) {
      return this.openSection(element, pageIndex);
    }
    if (LayoutSection.isHeaderElement(element)) {
      return this.openHeader(element, pageIndex);
    }
    if (element.tagName === "a") {
      let anchor_name = element.getAttribute("name") || "";
      if (anchor_name) {
        this.addAnchor(element, anchor_name, pageIndex);
      }
    }
    return undefined;
  }

  public getAnchor(anchor_name: string): Anchor | null {
    return this.anchor[anchor_name] || null;
  }

  public openSectionRoot(element: HtmlElement, pageIndex: number): LayoutSection {
    //console.log("openSectionRoot:", element.tagName);
    if (!this.rootElement) {
      return this.curSection;
    }
    this.rootElement = element;
    //console.log("set section root:", element.tagName);
    return this.openSection(element, pageIndex);
  }

  public openSection(element: HtmlElement, pageIndex: number): LayoutSection {
    // <sect> <- cur(already closed)
    //   content
    // </sect>
    // <sect> <- next!
    if (this.curSection.closed) {
      this.curSection = this.createNextSection(pageIndex);
    }
    // <sect> <- cur(still open)
    //   content
    //   <sect> <- sub!
    else {
      this.curSection = this.createSubSection(pageIndex);
    }
    return this.curSection;
  }

  public closeSection(element?: HtmlElement): LayoutSection {
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

  protected addAnchor(element: HtmlElement, anchor_name: string, pageIndex: number) {
    this.anchor[anchor_name] = {
      name: anchor_name,
      pageIndex,
    };
  }

  protected openHeader(element: HtmlElement, pageIndex: number): LayoutSection {
    this.curSection = this.addHeader(element, pageIndex);
    return this.curSection;
  }

  protected get curTitle(): string {
    let close_state = this.curSection.closed ? "(closed)" : "(open)";
    return this.curSection.title + close_state;
  }

  protected createContextSection(pageIndex: number, header?: HtmlElement): LayoutSection {
    let section = new LayoutSection(header);
    section.pageIndex = pageIndex;
    return section;
  }

  protected createStandAloneSubSection(pageIndex: number, header?: HtmlElement):
    LayoutSection {
    let section = this.createContextSection(pageIndex, header);
    section.closed = true; // stand alone
    this.curSection.addChild(section);
    //console.log("[%s] create stand alone sub section:%s", this.curTitle, section.title);
    return section;
  }

  protected createSubSection(pageIndex: number, header?: HtmlElement): LayoutSection {
    //let section = new LayoutSection(header);
    let section = this.createContextSection(pageIndex, header);
    this.curSection.addChild(section);
    //console.log("[%s] create sub section:%s", this.curTitle, section.title);
    return section;
  }

  protected createNextSection(pageIndex: number, header?: HtmlElement): LayoutSection {
    //let section = new LayoutSection(header);
    let section = this.createContextSection(pageIndex, header);
    let root_section = this.closeSection();
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

  protected createHigherSection(pageIndex: number, header: HtmlElement, max_level: number):
    LayoutSection {
    //console.log("createHigherSection: %s, dst level:%d", header.textContent, max_level); 
    if (this.curSection.parent) {
      this.curSection = this.closeHigherSection(this.curSection.parent, max_level);
    }
    return this.createNextSection(pageIndex, header);
  }

  protected addHeader(header: HtmlElement, pageIndex: number): LayoutSection {
    //console.log("[%s] addHeader(%s):%s", this.curTitle, header.tagName, header.textContent);
    if (!this.curSection.header) { // header is not set yet
      if (!this.curSection.parent) { // root section
        //console.log("[%s] accepted first header", this.curTitle);
        return this.createSubSection(pageIndex, header); // create sub section with header
      }
      this.curSection.setHeader(header);
      return this.curSection;
    }
    let cur_level = this.curSection.level;
    let new_level = Utils.getHeaderLevel(header);
    //console.log("[%s] h%d -> h%d", this.curTitle, cur_level, new_level);
    if (new_level > cur_level) { // lower level makes stand alone sub section.
      return this.createStandAloneSubSection(pageIndex, header);
    }
    if (new_level === cur_level) { // same level makes continuous section.
      return this.createNextSection(pageIndex, header);
    }
    this.curSection.closed = true;

    // higher level close current section and create new section.
    return this.createHigherSection(pageIndex, header, new_level);
  }
}
