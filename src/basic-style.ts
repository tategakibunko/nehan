import {
  Config,
  Utils
} from "./public-api";

export interface BasicStyleValue {
  initial: string,
  inherit: boolean
}

let defaults: { [cssProp: string]: BasicStyleValue } = {
  "after": {
    initial: "auto",
    inherit: false
  },
  "background-position": {
    initial: "0% 0%",
    inherit: false
  },
  "before": {
    initial: "auto",
    inherit: false
  },
  "box-sizing": {
    initial: "content-box",
    inherit: false
  },
  "border": {
    initial: "medium none currentcolor",
    inherit: false
  },
  "border-collapse": {
    initial: "collapse",
    inherit: true
  },
  "border-style": {
    initial: "0 none black",
    inherit: false
  },
  "border-color": {
    initial: Config.defaultBorderColor,
    inherit: false
  },
  "border-width": {
    initial: "0",
    inherit: false
  },
  "border-before": {
    initial: "none",
    inherit: false
  },
  "border-end": {
    initial: "none",
    inherit: false
  },
  "border-after": {
    initial: "none",
    inherit: false
  },
  "border-start": {
    initial: "none",
    inherit: false
  },
  "border-before-width": {
    initial: "0",
    inherit: false
  },
  "border-end-width": {
    initial: "0",
    inherit: false
  },
  "border-after-width": {
    initial: "0",
    inherit: false
  },
  "border-start-width": {
    initial: "0",
    inherit: false
  },
  "border-before-color": {
    initial: Config.defaultBorderColor,
    inherit: false
  },
  "border-end-color": {
    initial: Config.defaultBorderColor,
    inherit: false
  },
  "border-after-color": {
    initial: Config.defaultBorderColor,
    inherit: false
  },
  "border-start-color": {
    initial: Config.defaultBorderColor,
    inherit: false
  },
  "border-before-style": {
    initial: "none",
    inherit: false
  },
  "border-end-style": {
    initial: "none",
    inherit: false
  },
  "border-after-style": {
    initial: "none",
    inherit: false
  },
  "border-start-style": {
    initial: "none",
    inherit: false
  },
  "border-radius": {
    initial: "0 0 0 0",
    inherit: false
  },
  "border-before-start-radius": {
    initial: "0",
    inherit: false
  },
  "border-before-end-radius": {
    initial: "0",
    inherit: false
  },
  "border-after-end-radius": {
    initial: "0",
    inherit: false
  },
  "border-after-start-radius": {
    initial: "0",
    inherit: false
  },
  "break-after": {
    initial: "auto",
    inherit: false
  },
  "break-before": {
    initial: "auto",
    inherit: false
  },
  "caption-side": {
    initial: "before",
    inherit: true
  },
  "clear": {
    initial: "none",
    inherit: false
  },
  "color": {
    initial: "black",
    inherit: true
  },
  "content": {
    initial: "",
    inherit: false
  },
  "direction": {
    initial: "ltr",
    inherit: true
  },
  "display": {
    initial: "inline",
    inherit: false
  },
  "end": {
    initial: "auto",
    inherit: false
  },
  "extent": {
    initial: "auto",
    inherit: false
  },
  "float": {
    initial: "none",
    inherit: false
  },
  "font": {
    initial: Config.defaultFont,
    inherit: true
  },
  "font-family": {
    initial: Config.defaultFontFamily,
    inherit: true
  },
  "font-size": {
    initial: Config.defaultFontSize + "px",
    inherit: true
  },
  "font-size-adjust": {
    initial: "none",
    inherit: true
  },
  "font-stretch": {
    initial: "normal",
    inherit: true
  },
  "font-style": {
    initial: "normal",
    inherit: true
  },
  "font-variant": {
    initial: "normal",
    inherit: true
  },
  "font-weight": {
    initial: "normal",
    inherit: true
  },
  "block-size": {
    initial: "auto",
    inherit: false
  },
  "height": {
    initial: "auto",
    inherit: false
  },
  "letter-spacing": {
    initial: "normal",
    inherit: true
  },
  "line-height": {
    initial: String(Config.defaultLineHeight),
    inherit: true
  },
  "list-style": {
    initial: "disc outside none",
    inherit: true
  },
  "list-style-type": {
    initial: "disc",
    inherit: true
  },
  "list-style-position": {
    initial: "outside",
    inherit: true
  },
  "list-style-image": {
    initial: "none",
    inherit: true
  },
  "margin": {
    initial: "0",
    inherit: false
  },
  "margin-before": {
    initial: "0",
    inherit: false
  },
  "margin-end": {
    initial: "0",
    inherit: false
  },
  "margin-after": {
    initial: "0",
    inherit: false
  },
  "margin-start": {
    initial: "0",
    inherit: false
  },
  "max-extent": {
    initial: "none",
    inherit: false
  },
  "max-measure": {
    initial: "none",
    inherit: false
  },
  "measure": {
    initial: "auto",
    inherit: false
  },
  "min-extent": {
    initial: "none",
    inherit: false
  },
  "min-measure": {
    initial: "none",
    inherit: false
  },
  "overflow-wrap": {
    initial: "normal",
    inherit: true
  },
  "page": {
    initial: "auto",
    inherit: true
  },
  "padding": {
    initial: "0",
    inherit: false
  },
  "padding-before": {
    initial: "0",
    inherit: false
  },
  "padding-end": {
    initial: "0",
    inherit: false
  },
  "padding-after": {
    initial: "0",
    inherit: false
  },
  "padding-start": {
    initial: "0",
    inherit: false
  },
  "page-break-after": {
    initial: "auto",
    inherit: false
  },
  "page-break-before": {
    initial: "auto",
    inherit: false
  },
  "position": {
    initial: "static",
    inherit: false
  },
  "size": {
    initial: "auto",
    inherit: false
  },
  "start": {
    initial: "auto",
    inherit: false
  },
  "table-layout": {
    initial: "auto",
    inherit: false
  },
  "text-align": {
    initial: "start",
    inherit: true
  },
  "text-combine-upright": {
    initial: "none",
    inherit: true
  },
  "text-emphasis-color": {
    initial: "currentcolor",
    inherit: false
  },
  "text-emphasis-style": {
    initial: "none",
    inherit: false
  },
  // This is not formal prop, defined for convenience.
  "text-emphasis-style-stroke": {
    initial: "none",
    inherit: false
  },
  // This is not formal prop, defined for convenience.
  "text-emphasis-style-mark": {
    initial: "dot",
    inherit: false
  },
  "text-decoration": {
    initial: "none",
    inherit: false
  },
  "text-indent": {
    initial: "0",
    inherit: true
  },
  "text-justify": {
    initial: "none",
    inherit: true
  },
  "text-orientation": {
    initial: "mixed",
    inherit: true
  },
  "text-shadow": {
    initial: "0",
    inherit: false
  },
  "text-transform": {
    initial: "none",
    inherit: true
  },
  "unicode-bidi": {
    initial: "normal",
    inherit: false
  },
  "vertical-align": {
    initial: "baseline",
    inherit: false
  },
  "visibility": {
    initial: "inherit",
    inherit: false
  },
  "width": {
    initial: "auto",
    inherit: false
  },
  "white-space": {
    initial: "normal",
    inherit: true
  },
  "word-break": {
    initial: "normal",
    inherit: true
  },
  "writing-mode": {
    initial: "horizontal-tb",
    inherit: true
  }
}

export class BasicStyle {
  // if [value] is member of [values], use it.
  // if not, use default value of [prop].
  static selectOrDefault(prop: string, value: string, values: string[]): string {
    return Utils.Choice.select({
      name: prop,
      value: value,
      values: values,
      initial: BasicStyle.getInitialValue(prop)
    });
  }

  static get(prop: string): BasicStyleValue {
    let entry: BasicStyleValue = defaults[prop];
    if (!entry) {
      throw new Error("Invalid property:" + prop);
    }
    return entry;
  }

  static getInitialValue(prop: string): string {
    return this.get(prop).initial;
  }

  static isInheritalbe(prop: string): boolean {
    return this.get(prop).inherit;
  }
}

