import {
  FlowRegion,
  LogicalBox,
  LogicalBoxEdge,
  ListItemContext,
} from "./public-api";

export class ListItemRegion extends FlowRegion {
  public outsideListMarker: LogicalBox | null;

  constructor(context: ListItemContext){
    super(context);
    this.outsideListMarker = null;
  }

  public setOutsideListMarker(marker: LogicalBox){
    this.outsideListMarker = marker;
  }

  public addInlineOffset(line: LogicalBox){
    line.contextEdge = line.contextEdge || LogicalBoxEdge.none;
    line.contextEdge.padding.start += this.outsideMarkerMeasure;
  }
  
  public get outsideMarkerMeasure(): number {
    return this.outsideListMarker? this.outsideListMarker.totalMeasure : 0;
  }

  public get maxContextBoxMeasure(): number {
    // [workaround]
    // url: https://github.com/Microsoft/TypeScript/issues/338
    // In es5, public property via super isn't supported.
    // Disable this code after googlebot supports es6.
    let max = <FlowRegion['maxContextBoxMeasure']>Reflect.get(FlowRegion.prototype, 'maxContextBoxMeasure', this);

    // if first line, marker size is already added to this.cursor.start
    if(this.context.isFirstLine()){
      // return super.maxContextBoxMeasure;
      return max;
    }
    // return super.maxContextBoxMeasure - this.outsideMarkerMeasure;
    return max - this.outsideMarkerMeasure;
  }
}
