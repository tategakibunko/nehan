import {
  FlowContext,
  TableRegion,
  LayoutGenerator,
  BoxType,
  LogicalBox,
  BorderCollapse,
  CssLoader,
} from "./public-api";

export class TableContext extends FlowContext {
  public parent: FlowContext; // not null
  public region: TableRegion;

  protected createRegion(): TableRegion {
    return new TableRegion(this);
  }

  public getCellMeasure(index: number): number {
    return this.region.getCellMeasure(index);
  }

  protected createFirstGenerator(): LayoutGenerator {
    // if border-collapse is available, all margin between
    // table <-> tgroup, tgroup <-> tr, tr <-> cell
    // are disabled.
    let border_collapse = BorderCollapse.load(this.element);
    if(border_collapse.isCollapse()){
      BorderCollapse.disableEdge(this.element);
    }

    // all css is required to calc table sizing.
    CssLoader.loadAll(this.element);

    if(border_collapse.isCollapse()){
      BorderCollapse.collapse(this.element);
    }
    // re-separate cell using css settings.
    this.region.separateCell();
    if(this.region.isBadSeparation()){
      console.error("[%s] table invalid separation(too deep), can't display.", this.name);
      this.abort();
    }
    return super.createFirstGenerator();
  }

  public createBlockBox(overflow: boolean, box_type = BoxType.TABLE): LogicalBox {
    return super.createBlockBox(overflow, BoxType.TABLE);
  }
}

