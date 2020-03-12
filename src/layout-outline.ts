import {
  HtmlElement,
  LayoutSection,
  ILayoutOutlineCallbacks,
  LayoutOutlineParser,
  ILayoutOutlineEvaluator,
  Anchor,
} from "./public-api";

export class LayoutOutline {
  public rootElement?: HtmlElement;
  public rootSection: LayoutSection;
  public curSection: LayoutSection;
  public anchors: { [anchor_name: string]: Anchor };

  constructor() {
    this.rootSection = new LayoutSection();
    this.curSection = this.rootSection;
    this.anchors = {};
  }

  public acceptEvaluator(visitor: ILayoutOutlineEvaluator): HTMLElement {
    return visitor.visitSectionRoot(this.rootSection);
  }

  public createElement(callbacks?: ILayoutOutlineCallbacks): HTMLElement {
    //console.log("createElement:", this.rootSection);
    return LayoutOutlineParser.parseSection(this.rootSection, callbacks);
  }

  public openElement(element: HtmlElement, pageIndex: number): LayoutSection | undefined {
    if (LayoutSection.isSectioningRootElement(element)) {
      return this.openSectionRoot(element, pageIndex);
    }
    if (LayoutSection.isSectioningElement(element)) {
      return this.openSection(pageIndex);
    }
    if (LayoutSection.isHeaderElement(element)) {
      return this.openHeader(element, pageIndex);
    }
    if (element.tagName === "a") {
      const anchorName = element.getAttribute("name") || "";
      if (anchorName) {
        this.addAnchor(anchorName, pageIndex);
      }
    }
    return undefined;
  }

  public closeElement(element?: HtmlElement): LayoutSection {
    if (element && LayoutSection.isSectioningElement(element) === false) {
      return this.curSection;
    }
    return this.closeSection();
  }

  public getAnchor(anchorName: string): Anchor | undefined {
    return this.anchors[anchorName];
  }

  protected openSectionRoot(element: HtmlElement, pageIndex: number): LayoutSection {
    // console.log("openSectionRoot:", element.tagName);
    if (!this.rootElement) {
      return this.curSection;
    }
    this.rootElement = element;
    // console.log("set section root:", element.tagName);
    return this.openSection(pageIndex);
  }

  protected openSection(pageIndex: number): LayoutSection {
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

  protected closeSection(): LayoutSection {
    const before = this.curTitle;
    if (this.curSection.parent) {
      this.curSection = this.curSection.parent;
    }
    // console.log("closeSection: %s -> %s", before, this.curTitle);
    return this.curSection;
  }

  protected addAnchor(anchorName: string, pageIndex: number) {
    this.anchors[anchorName] = { name: anchorName, pageIndex };
  }

  protected openHeader(element: HtmlElement, pageIndex: number): LayoutSection {
    this.curSection = this.addHeader(element, pageIndex);
    return this.curSection;
  }

  protected get curTitle(): string {
    let closeState = this.curSection.closed ? "(closed)" : "(open)";
    return this.curSection.title + closeState;
  }

  protected createContextSection(pageIndex: number, header?: HtmlElement): LayoutSection {
    let section = new LayoutSection(header);
    section.pageIndex = pageIndex;
    return section;
  }

  protected createStandAloneSubSection(pageIndex: number, header?: HtmlElement): LayoutSection {
    const section = this.createContextSection(pageIndex, header);
    section.closed = true; // stand alone
    this.curSection.addChild(section);
    // console.log("[%s] create stand alone sub section:%s", this.curTitle, section.title);
    return section;
  }

  protected createSubSection(pageIndex: number, header?: HtmlElement): LayoutSection {
    const section = this.createContextSection(pageIndex, header);
    this.curSection.addChild(section);
    // console.log("[%s] create sub section:%s", this.curTitle, section.title);
    return section;
  }

  protected createNextSection(pageIndex: number, header?: HtmlElement): LayoutSection {
    const section = this.createContextSection(pageIndex, header);
    const rootSection = this.closeSection();
    rootSection.addChild(section);
    // console.log("[%s] create next section:%s", this.curTitle, section.title);
    return section;
  }

  protected closeHigherSection(section: LayoutSection, maxLevel: number): LayoutSection {
    if (!section.parent || !section.parent.parent || section.level <= maxLevel) {
      return section;
    }
    section.closed = true;
    return this.closeHigherSection(section.parent, maxLevel);
  }

  protected createHigherSection(pageIndex: number, header: HtmlElement, max_level: number): LayoutSection {
    // console.log("createHigherSection: %s, dst level:%d", header.textContent, max_level);
    if (this.curSection.parent) {
      this.curSection = this.closeHigherSection(this.curSection.parent, max_level);
    }
    return this.createNextSection(pageIndex, header);
  }

  protected addHeader(header: HtmlElement, pageIndex: number): LayoutSection {
    // console.log("[%s] addHeader(%s):%s", this.curTitle, header.tagName, header.textContent);
    if (!this.curSection.header) { // header is not set yet
      if (!this.curSection.parent) { // root section
        // console.log("[%s] accepted first header", this.curTitle);
        return this.createSubSection(pageIndex, header); // create sub section with header
      }
      this.curSection.setHeader(header);
      return this.curSection;
    }
    const curLevel = this.curSection.level;
    const newLevel = LayoutSection.getHeaderLevel(header);
    // console.log("[%s] h%d -> h%d", this.curTitle, curLevel, newLevel);
    if (newLevel > curLevel) { // lower level makes stand alone sub section.
      return this.createStandAloneSubSection(pageIndex, header);
    }
    if (newLevel === curLevel) { // same level makes continuous section.
      return this.createNextSection(pageIndex, header);
    }
    this.curSection.closed = true;

    // higher level close current section and create new section.
    return this.createHigherSection(pageIndex, header, newLevel);
  }
}
