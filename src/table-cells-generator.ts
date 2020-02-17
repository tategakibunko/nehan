import {
  ILogicalNodeGenerator,
  ILayoutFormatContext,
  ILogicalNode,
  LayoutResult,
  HtmlElement,
  BoxEnv,
  BlockNodeGenerator,
  FlowRootFormatContext,
  ILayoutReducer,
  FlowFormatContext,
} from './public-api';
import { RootBlockReducer } from './layout-reducer';

export class TableCellsFormatContext extends FlowFormatContext {
  public maxCellExtent: number;
  public cells: ILogicalNode[];

  constructor(
    public elements: HtmlElement[],
    public env: BoxEnv,
    public parent?: ILayoutFormatContext,
  ) {
    super(env, parent);
    this.maxCellExtent = 0;
    this.cells = [];
  }

  addCell(cell: any, index: number) {
    this.cells.push(cell);
    this.cursorPos.start += cell.measure;
    this.maxCellExtent = Math.max(this.maxCellExtent, cell.extent);
  }
}

export class TableCellsReducer implements ILayoutReducer {
  static instance = new TableCellsReducer();
  private constructor() { }

  visit(context: TableCellsFormatContext): any {
    console.log("cells reducer:", context);
    throw new Error("todo");
  }
}

export class TableCellsGenerator implements ILogicalNodeGenerator {
  private generator: Generator<LayoutResult>;

  constructor(
    public context: TableCellsFormatContext,
    public reducer = TableCellsReducer.instance,
  ) {
    this.generator = this.createGenerator();
  }

  getNext(): LayoutResult | undefined {
    const next = this.generator.next();
    return next.done ? undefined : next.value;
  }

  *createGenerator(): Generator<LayoutResult> {
    const cellGenerators = this.context.elements.map(cellElement => {
      const env = new BoxEnv(cellElement);
      const context = new FlowRootFormatContext(env, this.context);
      return new BlockNodeGenerator(context);
    });

    // [todo] overflow check
    this.context.addBorderBoxEdge("before");
    this.context.addBorderBoxEdge("start");
    this.context.addBorderBoxEdge("end");
    for (let loopCount = 0; ; loopCount++) {
      const values = cellGenerators.map(cellGen => cellGen.getNext());
      if (values.every(value => value === undefined)) {
        break;
      }
      if (loopCount % 2 === 0) {
        values.forEach((value, index) => {
          if (value) {
            if (value.type === "block") {
              this.context.addCell(value.body, index);
            }
          } else {
            const emptyCell = cellGenerators[index].context.acceptLayoutReducer(RootBlockReducer.instance);
            this.context.addCell(emptyCell, index);
          }
        });
      } else {
        yield this.context.acceptLayoutReducer(this.reducer);
        yield LayoutResult.pageBreak;
      }
    } // for(loopCount)
    this.context.addBorderBoxEdge("after");
    yield this.context.acceptLayoutReducer(this.reducer);
  }
}
