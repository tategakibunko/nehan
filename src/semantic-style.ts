import {
  CssStyleSheet,
  CssRules,
} from "./public-api";

export interface SemanticStyleCreateOptions {
  all?: boolean;
  listStyle?: boolean;
  textAlign?: boolean;
  textCombine?: boolean;
  textEmphasis?: boolean;
  logicalFloat?: boolean;
  pageBreak?: boolean;
  typography?: boolean;
}

let pageBreak: CssRules = {
  ".page.break.after": {
    "page-break-after": "always"
  },
  ".page.break.before": {
    "page-break-before": "always"
  },
  "hr.page.break.before": {
    "border-width": "0",
    "extent": "0",
    "margin": "0"
  },
  "hr.page.break.after": {
    "border-width": "0",
    "extent": "0",
    "margin": "0"
  }
};

let listStyle: CssRules = {
  ".list.outside": {
    "list-style-position": "outside"
  },
  ".list.inside": {
    "list-style-position": "inside"
  }
};

let logicalFloat: CssRules = {
  ".float.start": {
    "float": "start"
  },
  ".float.end": {
    "float": "end"
  },
  ".clear.start": {
    "clear": "start"
  },
  ".clear.end": {
    "clear": "end"
  },
  ".clear.both": {
    "clear": "both"
  }
};

let textAlign: CssRules = {
  ".text.align.start": {
    "text-align": "start"
  },
  ".text.align.center": {
    "text-align": "center"
  },
  ".text.align.end": {
    "text-align": "end"
  }
};

let textCombine: CssRules = {
  ".tcy": {
    "text-combine-upright": "all"
  },
};

let textEmphasis: CssRules = {
  ".empha.filled.dot": {
    "text-emphasis": "filled dot"
  },
  ".empha.open.dot": {
    "text-emphasis": "open dot"
  },
  ".empha.filled.circle": {
    "text-emphasis": "filled circle"
  },
  ".empha.open.circle": {
    "text-emphasis": "open circle"
  },
  ".empha.filled.triangle": {
    "text-emphasis": "filled triangle"
  },
  ".empha.open.triangle": {
    "text-emphasis": "open triangle"
  },
  ".empha.filled.double.circle": {
    "text-emphasis": "filled double-circle"
  },
  ".empha.open.double.circle": {
    "text-emphasis": "open double-circle"
  },
  ".empha.filled.sesame": {
    "text-emphasis": "filled sesame"
  },
  ".empha.open.sesame": {
    "text-emphasis": "open sesame"
  },
};

let typography: CssRules = {
  ".dropcaps::first-letter": {
    "display": "inline-block",
    "measure": "1em",
    "extent": "1em",
    "line-height": "1",
    "float": "start",
    "font-size": "4em"
  }
};

export class SemanticStyle {
  static create(options: SemanticStyleCreateOptions): CssStyleSheet {
    let rules: CssRules = {};
    if (options.all === true || options.pageBreak === true) {
      Object.assign(rules, pageBreak);
    }
    if (options.all === true || options.listStyle === true) {
      Object.assign(rules, listStyle);
    }
    if (options.all === true || options.logicalFloat === true) {
      Object.assign(rules, logicalFloat);
    }
    if (options.all === true || options.textAlign === true) {
      Object.assign(rules, textAlign);
    }
    if (options.all === true || options.textCombine === true) {
      Object.assign(rules, textCombine);
    }
    if (options.all === true || options.textEmphasis === true) {
      Object.assign(rules, textEmphasis);
    }
    if (options.all === true || options.typography === true) {
      Object.assign(rules, typography);
    }
    return new CssStyleSheet(rules);
  }
};
