import {
  ListStylePosition,
  ListStyleType,
  NativeStyleMap,
  HtmlElement,
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

  public insertMarkerText(element: HtmlElement) {
    const markerElement = element.firstChild;
    if (!markerElement || markerElement.tagName !== PseudoElementTagName.MARKER) {
      return;
    }
    if (markerElement.firstChild && markerElement.firstChild.isTextElement()) {
      return;
    }
    let markerText = this.getMarkerText(element.indexOfType);
    if (element.querySelectorAll("li").length > 0) {
      markerText = SpaceChar.markerSpace;
    }
    const markerTextNode = element.root.createTextNode(markerText);
    markerElement.appendChild(markerTextNode);
  }

  static load(element: HtmlElement): ListStyle {
    let list_style = new ListStyle();
    list_style.type_ = ListStyleType.load(element);
    list_style.position = ListStylePosition.load(element);
    list_style.image = ListStyle.loadImage(element);
    return list_style;
  }

  static loadImage(element: HtmlElement): string {
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

  static parseShorthand(css_text: CssText): PropValue<string, string>[] {
    let declr: { [keyword: string]: string } = {
      "list-style-image": "none",
      "list-style-type": "none",
      "list-style-position": "outside"
    };
    css_text.split().forEach((value) => {
      let prop = ListStyle.inferProp(value);
      declr[prop] = value;
    });
    return Object.keys(declr).map((prop) => {
      return { prop: prop, value: declr[prop] };
    });
  }
}

