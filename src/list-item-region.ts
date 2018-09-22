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
    // if first line, marker size is already added to this.cursor.start
    if(this.context.isFirstLine()){
      return super.maxContextBoxMeasure;
    }
    return super.maxContextBoxMeasure - this.outsideMarkerMeasure;
  }
}
