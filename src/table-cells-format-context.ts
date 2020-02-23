import {
  BoxEnv,
  HtmlElement,
  FlowFormatContext,
  LogicalBlockNode,
  ILayoutFormatContext,
  LayoutResult,
  TableCellsReducer,
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

  acceptLayoutReducer(reducer: TableCellsReducer, isLastRow: boolean): LayoutResult {
    return reducer.visit(this, isLastRow);
  }

  setCells(cells: LogicalBlockNode[]) {
    const isCollapse = this.env.borderCollapse.isCollapse();
    this.cells = cells;
    const maxContentExtent = Math.max(...cells.map(cell => cell.size.extent));
    const maxTotalExtent = Math.max(...cells.map(cell => cell.extent));
    this.cells.forEach((cell, index) => {
      cell.size.extent = maxContentExtent;
      cell.size.extent += maxTotalExtent - cell.extent;
      cell.pos.start = this.cursorPos.start;
      this.cursorPos.start += cell.measure;
      // Collapse border of inline level.
      // Note that block level collapsing is done by parent context.
      if (isCollapse) {
        const prevBorderSize = (index === 0) ? this.env.edge.border.width.start : this.cells[index - 1].border.width.end;
        const inlineCollapseSize = Math.min(prevBorderSize, cell.border.width.start);
        // console.log("inline collapse size:%d", inlineCollapseSize);
        cell.pos.start -= inlineCollapseSize;
        this.cursorPos.start -= inlineCollapseSize;
      }
    });
  }
}

