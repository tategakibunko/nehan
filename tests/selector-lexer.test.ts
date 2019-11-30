import * as Nehan from '../dist';

test("selector lexer", () => {
  let lexer = new Nehan.SelectorLexer("p.foo:first-child>a[name=foo]:first-child:nth-child(2)::first-element");
  while (lexer.hasNext()) {
    let token = lexer.getNext();
    console.log(token);
  }
});
