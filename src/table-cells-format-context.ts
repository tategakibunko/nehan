import {
  BoxEnv,
  HtmlElement,
  FlowFormatContext,
  LogicalBlockNode,
  LogicalBlockReNode,
  ILayoutFormatContext,
  LayoutResult,
  TableCellsReducer,
  LogicalLineNode,
} from './public-api';

export class TableCellsFormatContext extends FlowFormatContext {
  public cells: LogicalBlockNode[];

  constructor(
    public elements: HtmlElement[],
    public env: BoxEnv,
    public parent?: ILayoutFormatContext,
  ) {
    super(env, parent);
    this.cells = [];
  }

  acceptLayoutReducer(reducer: TableCellsReducer): LayoutResult {
    return reducer.visit(this);
  }

  setCells(cells: LogicalBlockNode[]) {
    this.cells = cells;
    const isCollapse = this.env.borderCollapse.isCollapse();
    const maxCell = cells.reduce((acm, cell) => acm.size.extent > cell.size.extent ? acm : cell, cells[0]);
    const maxContentExtent = maxCell.size.extent;
    const maxTotalExtent = Math.max(...cells.map(cell => cell.extent)); // add edge difference to content size.
    let startPos = 0;
    this.cells.forEach((cell, index) => {
      cell.size.extent = maxContentExtent; // align content extent.
      cell.size.extent += maxTotalExtent - cell.extent; // align total(edged) extent.
      cell.pos.start = startPos;
      startPos += cell.measure;
      // if max cell isn't finished yet, smaller cell must follow the border state.
      if (cell.autoSize.extent !== maxCell.extent && maxCell.border.afterWidth === 0) {
        cell.border.clearAfter();
      }
      // Collapse border of inline level.
      // Note that block level collapsing is done by parent context.
      if (isCollapse) {
        const prevBorderSize = (index === 0) ? this.env.edge.border.width.start : this.cells[index - 1].border.width.end;
        const inlineCollapseSize = Math.min(prevBorderSize, cell.border.width.start);
        // console.log("inline collapse size:%d", inlineCollapseSize);
        cell.pos.start -= inlineCollapseSize;
        startPos -= inlineCollapseSize;
      }
      // Set vertical-align for children of cell.
      const diffSize = cell.size.extent - cell.autoSize.extent; // diff between original size and aligned size.
      const valign = cell.env.verticalAlign.value;
      if (diffSize > 0 && (valign === "middle" || valign === "after")) {
        const delta = valign === "middle" ? Math.floor(diffSize / 2) : diffSize;
        cell.children.forEach(child => {
          if (child instanceof LogicalLineNode || child instanceof LogicalBlockNode || child instanceof LogicalBlockReNode) {
            child.pos.before += delta;
          }
        });
      }
    });
  }
}

