import {
  ListStylePosition,
  ListStyleType,
  NativeStyleMap,
  NehanElement,
  CssCascade,
  CssText,
  PropValue,
  PseudoElementTagName,
  SpaceChar,
} from "./public-api";

export class ListStyle {
  public position!: ListStylePosition;
  public type_!: ListStyleType; // keyword 'type' is reserved.
  public image!: string;

  public isNone(): boolean {
    return this.type_.isNone();
  }

  public isPositionOutside(): boolean {
    return this.position.isOutside();
  }

  public isPositionInside(): boolean {
    return this.position.isInside();
  }

  public isTcyMarker(): boolean {
    return this.type_.isTcyMarker();
  }

  public getMarkerText(index: number): string {
    return this.type_.getMarkerText(index);
  }

  public getCssListMarkerHori(): NativeStyleMap {
    let css = new NativeStyleMap();
    css.set("display", "inline-block");
    return css;
  }

  public getCssListBodyHori(): NativeStyleMap {
    let css = new NativeStyleMap();
    css.set("display", "inline-block");
    return css;
  }

  public insertMarkerText(element: NehanElement) {
    const markerElement = element.firstChild;
    if (!markerElement || markerElement.tagName !== PseudoElementTagName.MARKER) {
      return;
    }
    if (markerElement.firstChild && markerElement.firstChild.isTextElement()) {
      return; // already inserted
    }
    let markerText = this.getMarkerText(element.indexOfType);
    // if nested list-item exists, outer marker-text is set to space.
    if (element.querySelector("li")) {
      markerText = SpaceChar.markerSpace;
    }
    const markerTextNode = element.root.createTextNode(markerText);
    markerElement.appendChild(markerTextNode);
  }

  static load(element: NehanElement): ListStyle {
    const listStyle = new ListStyle();
    listStyle.type_ = ListStyleType.load(element);
    listStyle.position = ListStylePosition.load(element);
    listStyle.image = ListStyle.loadImage(element);
    return listStyle;
  }

  static loadImage(element: NehanElement): string {
    return CssCascade.getValue(element, "list-style-image");
  }

  static inferProp(value: string): string {
    if (value.indexOf("url(") >= 0) {
      return "list-style-image";
    }
    switch (value) {
      case "inside":
      case "outside":
        return "list-style-position";
    }
    return "list-style-type";
  }

  static parseShorthand(cssText: CssText): PropValue<string, string>[] {
    let declr: { [keyword: string]: string } = {
      "list-style-image": "none",
      "list-style-type": "none",
      "list-style-position": "outside"
    };
    cssText.split().forEach(value => {
      const prop = ListStyle.inferProp(value);
      declr[prop] = value;
    });
    return Object.keys(declr).map(prop => {
      return { prop, value: declr[prop] };
    });
  }
}

