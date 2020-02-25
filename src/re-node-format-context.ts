import {
  FlowFormatContext,
} from './public-api';

export class ReNodeFormatContext extends FlowFormatContext {
  get maxMeasure(): number {
    return this.parent ? this.parent.maxMeasure : super.maxMeasure;
  }

  get maxExtent(): number {
    return this.parent ? this.parent.maxExtent : super.maxExtent;
  }
}