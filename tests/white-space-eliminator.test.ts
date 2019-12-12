import * as Nehan from '../dist';
import { WhiteSpaceEliminator } from '../dist';

const html = `
<body>
  <!-- this is comment -->
  <main>
    <div>
      <p> text1</p>
      <p>text2</p>
      <p>text3</p>
    </div>
  </main>
  <article>
    <p>article</p>
  </article>
</body>`;

test("white-space-eliminator", () => {
  const doc = new Nehan.HtmlDocument(html);
  const body = doc.body.acceptNodeFilter(new WhiteSpaceEliminator());
  const main = body.firstChild;
  const div = main!.firstChild;
  const p1 = div!.firstChild;
  const p2 = p1!.nextSibling;
  const text1 = p1!.firstChild;
  const text2 = p2!.firstChild;
  const article = main!.nextSibling;

  expect(main!.tagName).toBe("main");
  expect(div!.tagName).toBe("div");
  expect(p1!.tagName).toBe("p");
  expect(text1!.textContent).toBe(" text1");
  expect(text2!.textContent).toBe("text2");
  expect(article!.tagName).toBe("article");
});
