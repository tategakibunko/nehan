/*
import {
  FlowContext,
  ListItemRegion,
  ListStyle,
  LogicalBox,
} from "./public-api";

export class ListItemContext extends FlowContext {
  public parent!: FlowContext; // not null
  public region!: ListItemRegion;

  public get listStyle(): ListStyle {
    return this.env.listStyle;
  }

  public get outsideMarker(): LogicalBox | null {
    return this.region.outsideListMarker;
  }

  public createRegion(): ListItemRegion {
    return new ListItemRegion(this);
  }

  public shiftInlineLevel(inline: LogicalBox): boolean {
    //console.log("[%s] shiftInlineLevel(marker):", this.name, inline);
    if (inline.tagName === "::marker" && this.listStyle.isPositionOutside()) {
      this.region.setOutsideListMarker(inline);
    }
    return super.shiftInlineLevel(inline);
  }

  public createLineBox(): LogicalBox {
    let line = super.createLineBox();
    if (this.counter.isYielded() || this.counter.isLineYielded()) {
      this.region.addInlineOffset(line);
    }
    return line;
  }
}
*/