import {
  Prefix,
  LayoutEvaluator,
  LogicalBox,
  BoxContent,
  ICharacter,
  isCharacter,
  LayoutParent,
  Word,
  Ruby,
  Char,
  RefChar,
  HalfChar,
  SpaceChar,
  SmpUniChar,
  MixChar,
  DualChar,
  Tcy,
  EmphasizableChar,
  TextEmphaData,
} from "./public-api";

export class VertLayoutEvaluator extends LayoutEvaluator {
  protected appendBoxChildAfter(node: HTMLElement, box: LogicalBox, child: BoxContent) {
    //console.log("appendBoxChildAfter:", child);
    if ((child instanceof Char ||
      child instanceof SmpUniChar ||
      child instanceof RefChar) &&
      child.hasEmphasis === false) {
      node.appendChild(document.createElement("br"));
    }
    if (isCharacter(child)) {
      let char = child as ICharacter;
      if (char.spacing > 0) {
        node.appendChild(this.createSpacing(char.spacing));
      }
    }
  }

  protected createSpacing(size: number): Node {
    let node = document.createElement("div");
    node.className = Prefix.addInternal("spacing");
    node.style.height = size + "px";
    node.appendChild(document.createTextNode(" "));
    return node;
  }

  protected createBlockNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    let node = document.createElement("div");
    let e_classes = box.classList.values().map(Prefix.addExternal);
    let i_classes = ["vertical", "block", box.pureTagName].map(Prefix.addInternal);
    i_classes.concat(e_classes).forEach(klass => node.classList.add(klass));
    if (box.id) {
      node.id = Prefix.addExternal(box.id);
    }
    box.getCssBlock(parent).apply(node);
    return node;
  }

  protected createInlineNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    let node = document.createElement("div");
    let e_classes = box.classList.values().map(Prefix.addExternal);
    let i_classes = ["inline", box.pureTagName].map(Prefix.addInternal);
    i_classes.concat(e_classes).forEach(klass => node.classList.add(klass));
    if (box.id) {
      node.id = Prefix.addExternal(box.id);
    }
    box.getCssInline(parent).apply(node);
    return node;
  }

  protected createInlineBlockNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    let node = document.createElement("div");
    let e_classes = box.classList.values().map(Prefix.addExternal);
    let i_classes = ["inline-block", box.pureTagName].map(Prefix.addInternal);
    i_classes.concat(e_classes).forEach(klass => node.classList.add(klass));
    if (box.id) {
      node.id = Prefix.addExternal(box.id);
    }
    box.getCssInlineBlock(parent).apply(node);
    return node;
  }

  protected createLineNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    let node = document.createElement("div");
    let i_classes = ["line", box.writingMode.value].map(Prefix.addInternal);
    i_classes.forEach(klass => node.classList.add(klass));
    box.getCssLine(parent).apply(node);
    return node;
  }

  protected createBaselineNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    let node = document.createElement("div");
    node.className = Prefix.addInternal("baseline");
    box.getCssBaseline(parent).apply(node);
    return node;
  }

  protected createTextNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    let node = document.createElement("div");
    node.className = Prefix.addInternal("text");
    box.getCssText(parent).apply(node);
    return node;
  }

  protected evalWord(parent: LogicalBox, word: Word): Node {
    //console.log("evalWord:", word);
    let node = document.createElement("div");
    let text = document.createTextNode(word.text);
    node.className = Prefix.addInternal("word");
    node.appendChild(text);
    return node;
  }

  protected evalRuby(parent: LogicalBox, ruby: Ruby): HTMLElement {
    //console.log("evalRuby:", ruby);
    let node = document.createElement("div");
    let rb = this.evalBox(parent, ruby.rb);
    let rt = this.evalBox(parent, ruby.rt);
    let e_classes = ruby.classes.map(Prefix.addExternal);
    let i_classes = ["ruby"].map(Prefix.addInternal);
    i_classes.concat(e_classes).forEach(klass => node.classList.add(klass));
    if (ruby.id) {
      node.id = Prefix.addExternal(ruby.id);
    }
    rb.className = Prefix.addInternal("rb");
    rt.className = Prefix.addInternal("rt");
    ruby.getCssRubyVert().apply(node);
    ruby.getCssRbVert().apply(rb);
    node.appendChild(rb);
    node.appendChild(rt);
    return node;
  }

  protected evalChar(parent: LogicalBox, char: Char): Node {
    //console.log("evalChar:", char);
    if (char.hasEmphasis && char.empha) {
      return this.evalEmphasizedCharacter(parent, char, char.empha);
    }
    return document.createTextNode(char.text);
  }

  protected evalEmphasizedCharacter(parent: LogicalBox, char: EmphasizableChar, empha: TextEmphaData): Node {
    //console.log("evalEmphasizedCharacter:", char);
    let node = document.createElement("div");
    let cnode = document.createElement("div");
    let enode = document.createElement("div");
    let mark = empha.text;
    let mark_style_values = empha.styles;
    // let mark = parent.env.textEmphasis.text;
    // let mark_style_values = parent.env.textEmphasis.style.values;
    node.className = Prefix.addInternal("empha");
    cnode.className = Prefix.addInternal("empha-src");
    ["empha-mark"].concat(mark_style_values).map(Prefix.addInternal).forEach(klass => {
      enode.classList.add(klass);
    });
    node.appendChild(cnode);
    node.appendChild(enode);
    cnode.appendChild(document.createTextNode(char.text));
    enode.appendChild(document.createTextNode(mark));
    return node;
  }

  protected evalSpaceChar(parent: LogicalBox, char: SpaceChar): Node {
    //console.log("evalSpaceChar:", char);
    let node = document.createElement("div");
    let text = document.createTextNode(char.text);
    char.getCssVert().apply(node);
    node.appendChild(text);
    return node;
  }

  protected evalRefChar(parent: LogicalBox, char: RefChar): Node {
    //console.log("evalRefChar:", char);
    if (char.hasEmphasis) {
      return this.evalEmphasizedCharacter(parent, char);
    }
    return document.createTextNode(char.text);
  }

  protected evalHalfChar(parent: LogicalBox, char: HalfChar): Node {
    //console.log("evalHalfChar:", char);
    let node = document.createElement("div");
    let text = document.createTextNode(char.text);
    char.getCssVert(parent).apply(node);
    node.appendChild(text);
    return node;
  }

  protected evalSmpUniChar(parent: LogicalBox, char: SmpUniChar): Node {
    //console.log("evalSmpUniChar:", char);
    return document.createTextNode(char.text);
  }

  protected evalMixChar(parent: LogicalBox, char: MixChar): Node {
    //console.log("evalMixChar:", char);
    let node = document.createElement("div");
    node.className = Prefix.addInternal("mix-char");
    node.appendChild(document.createTextNode(char.text));
    return node;
  }

  protected evalDualChar(parent: LogicalBox, char: DualChar): Node {
    //console.log("evalDualChar:", char);
    let node = document.createElement("div");
    let text = document.createTextNode(char.text);
    node.classList.add(Prefix.addInternal("vert-glyph"));
    node.appendChild(text);
    if (char.kerning) {
      node.classList.add(Prefix.addInternal("dual-char-kern"));
    }
    return node;
  }

  protected evalTcy(parent: LogicalBox, tcy: Tcy): Node {
    //console.log("evalTcy:", tcy);
    let node = document.createElement("div");
    let text = document.createTextNode(tcy.text);
    node.className = Prefix.addInternal("text-combine-upright");
    node.appendChild(text);
    return node;
  }
}
