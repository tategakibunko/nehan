/*
import {
  Prefix,
  LayoutEvaluator,
  LogicalBox,
  BoxContent,
  LayoutParent,
  Word,
  Ruby,
  Char,
  SpaceChar,
  RefChar,
  HalfChar,
  SmpUniChar,
  MixChar,
  DualChar,
  Tcy,
  EmphasizableChar,
  TextEmphaData,
} from "./public-api";

export class HoriLayoutEvaluator extends LayoutEvaluator {
  protected appendBoxChildAfter(node: HTMLElement, box: LogicalBox, child: BoxContent) {
    // do nothing
  }

  protected createBlockNode(parent: LayoutParent, box: LogicalBox): HTMLElement {
    let node = document.createElement("div");
    let e_classes = box.classList.values().map(Prefix.addExternal);
    let i_classes = ["horizontal", "block", box.pureTagName].map(Prefix.addInternal);
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
    let i_classes = ["horizontal", "inline-block", box.pureTagName].map(Prefix.addInternal);
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
    let node = document.createElement("span");
    node.className = Prefix.addInternal("text");
    box.getCssText(parent).apply(node);
    return node;
  }

  protected evalWord(parent: LogicalBox, word: Word): Node {
    //console.log("evalWord:", word);
    return document.createTextNode(word.text);
  }

  protected evalRuby(parent: LogicalBox, ruby: Ruby): HTMLElement {
    //console.log("evalRuby:", ruby);
    let node = document.createElement("div");
    let rt = this.evalBox(parent, ruby.rt);
    let rb = this.evalBox(parent, ruby.rb);
    let e_classes = ruby.classes.map(Prefix.addExternal);
    let i_classes = ["ruby"].map(Prefix.addInternal);
    i_classes.concat(e_classes).forEach(klass => node.classList.add(klass));
    if (ruby.id) {
      node.id = Prefix.addExternal(ruby.id);
    }
    ruby.getCssRbHori().apply(rb);
    node.appendChild(rt);
    node.appendChild(rb);
    return node;
  }

  protected evalChar(parent: LogicalBox, char: Char): Node {
    //console.log("evalChar:", char);
    if (char.empha) {
      return this.evalEmphasizedCharacter(parent, char, char.empha);
    }
    return document.createTextNode(char.text);
  }

  protected evalEmphasizedCharacter(parent: LogicalBox, char: EmphasizableChar, empha: TextEmphaData): Node {
    //console.log("evalEmphasizedCharacter:", char);
    const node = document.createElement("div");
    node.className = Prefix.add("empha");
    const cnode = document.createElement("div");
    const enode = document.createElement("div");
    const mark = empha.text;
    const mark_style_values = empha.styles;
    node.className = Prefix.addInternal("empha");
    cnode.className = Prefix.addInternal("empha-src");
    ["empha-mark"].concat(mark_style_values).map(Prefix.addInternal).forEach(klass => {
      enode.classList.add(klass);
    });
    node.appendChild(enode);
    node.appendChild(cnode);
    enode.appendChild(document.createTextNode(mark));
    cnode.appendChild(document.createTextNode(char.text));
    return node;
  }

  protected evalSpaceChar(parent: LogicalBox, char: SpaceChar): Node {
    //console.log("evalSpaceChar:", char);
    return document.createTextNode(char.text);
  }

  protected evalRefChar(parent: LogicalBox, char: RefChar): Node {
    //console.log("evalRefChar:", char);
    return document.createTextNode(char.text);
  }

  protected evalHalfChar(parent: LogicalBox, char: HalfChar): Node {
    //console.log("evalHalfChar:", char);
    return document.createTextNode(char.text);
  }

  protected evalSmpUniChar(parent: LogicalBox, char: SmpUniChar): Node {
    //console.log("evalSmpUniChar:", char);
    return document.createTextNode(char.text);
  }

  protected evalMixChar(parent: LogicalBox, char: MixChar): Node {
    //console.log("evalMixChar:", char);
    let node = document.createElement("span");
    node.className = Prefix.addInternal("mix-char");
    node.appendChild(document.createTextNode(char.text));
    return node;
  }

  protected evalDualChar(parent: LogicalBox, char: DualChar): Node {
    //console.log("evalDualChar:", char);
    let node = document.createElement("span");
    node.classList.add(Prefix.addInternal("dual-char"));
    node.appendChild(document.createTextNode(char.text));
    if (char.kerning) {
      node.classList.add(Prefix.addInternal("dual-char-kern"));
    }
    return node;
  }

  protected evalTcy(parent: LogicalBox, tcy: Tcy): Node {
    //console.log("evalTcy:", tcy);
    return document.createTextNode(tcy.text);
  }
}
*/
