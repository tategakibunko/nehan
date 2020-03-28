/*
import {
  ReplacedElementContext,
  LogicalSize,
  PhysicalSize,
} from "./public-api";

export class ReplacedElementRegion {
  protected context: ReplacedElementContext;
  protected size: LogicalSize; // original size

  constructor(context: ReplacedElementContext){
    this.context = context;
    this.size = this.createSize();
  }

  public isEnoughSpaceLeft(): boolean {
    let rest_extent = this.restContextBoxExtent;
    let rest_measure = this.restContextBoxMeasure;

    // enough space is left for original size.
    if(rest_extent >= this.size.extent &&
       rest_measure >= this.size.measure){
      return true;
    }
    // 1. 50% of body-extent is left.
    // 2. rest measure is over 60% of original measure
    let body_extent = this.context.parent.body.region.maxContextBoxExtent;
    if(rest_extent / body_extent >= 0.5 &&
       rest_measure / this.size.measure >= 0.6){
      return true;
    }
    // 1. rest extent is over 60% of original extent
    // 2. rest measure is over 60% of original measure
    if(rest_extent / this.size.extent >= 0.6 &&
       rest_measure / this.size.measure >= 0.6){
      return true;
    }
    return false;
  }

  public get totalEdgeExtent(): number {
    return this.context.env.edge.extent;
  }

  public get totalEdgeMeasure(): number {
    return this.context.env.edge.measure;
  }

  public getSizeForRestSpace(): LogicalSize {
    let max_size = this.createRestSize();
    return this.size.resize(max_size);
  }

  public getSizeForMaxSpace(): LogicalSize {
    let max_size = this.createMaxSize();
    return this.size.resize(max_size);
  }

  protected createSize(): LogicalSize {
    let writing_mode = this.context.env.writingMode;
    return PhysicalSize.load(this.context.element).getLogicalSize(writing_mode);
  }

  // max-size after page-break
  protected createMaxSize(): LogicalSize {
    return new LogicalSize({
      measure:this.context.parent.region.maxEdgedBoxMeasure - this.totalEdgeMeasure,
      extent: this.context.parent.region.maxEdgedBoxExtent - this.totalEdgeExtent
    });
  }

  protected createRestSize(): LogicalSize {
    return new LogicalSize({
      measure:this.restContextBoxMeasure,
      extent:this.restContextBoxExtent
    });
  }

  // We use restEdgedSize(restSize but all edge is included).
  // Final edged of paernt block is not available until image is yielded
  // because ImageContext::isFinalOutput is false.
  // But if we resize the image to it's maxContextBoxExtent of parent region and yield the image,
  // final edge is immediately available in parent context
  // because now image is already yielded and ImageContext::isFinalOutput is true.
  // Thereby the restContextBoxExtent changes before/after image is yielded or not.
  // So we reduce parental parent edge size precedently from parent region size.
  public get restContextBoxExtent(): number {
    let root_rest = this.context.parent.region.restEdgedBoxExtent;
    let edge_size = this.totalEdgeExtent;
    return root_rest - edge_size;
  }

  public get restContextBoxMeasure(): number {
    let root_rest = this.context.parent.region.restEdgedBoxMeasure;
    let edge_size = this.totalEdgeMeasure;
    return root_rest - edge_size;
  }
}
*/
