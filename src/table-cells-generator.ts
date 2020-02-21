import {
  ILogicalNodeGenerator,
  LayoutResult,
  BoxEnv,
  BlockNodeGenerator,
  FlowRootFormatContext,
  RootBlockReducer,
  TableCellsFormatContext,
  TableCellsReducer,
} from './public-api';

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
    let loopCount = 0;
    while (true) {
      const values = cellGenerators.map(cellGen => cellGen.getNext());
      if (values.every(value => value === undefined)) {
        break;
      }
      // if some cell yields page-break at the beginning of layout, then yield nothing but page-break.
      if (loopCount === 0 && values.some(value => value && value.type === "page-break")) {
        yield LayoutResult.pageBreak;
        continue; // Note that loopCount remains 0.
      }
      if (loopCount % 2 === 0) {
        const cellBlocks = values.map((value, index) => {
          if (value && value.type === "block") {
            return value.body;
          }
          return cellGenerators[index].context.acceptLayoutReducer(RootBlockReducer.instance).body;
        });
        this.context.setCells(cellBlocks);
      } else {
        yield this.context.acceptLayoutReducer(this.reducer, loopCount === 1, false);
        yield LayoutResult.pageBreak;
      }
      loopCount++;
    } // for(loopCount)
    yield this.context.acceptLayoutReducer(this.reducer, loopCount === 1, true);
  }
}
