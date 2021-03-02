import {
  ILogicalCursorPos,
} from "./public-api";

export interface ILogicalNodePos {
  clientPos: ILogicalCursorPos;
  offsetPos: ILogicalCursorPos;
}

/*
export class LogicalNodePos implements ILogicalNodePos {
  constructor(
    public clientPos: ILogicalCursorPos,
    public offsetPos: ILogicalCursorPos,
  ) { }

  get start(): number {
    return this.clientPos.start + this.offsetPos.start;
  }

  get before(): number {
    return this.clientPos.before + this.offsetPos.before;
  }
}
*/