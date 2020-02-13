import { HtmlDocument, HtmlElement, BlockOffset } from '../dist';

// 1em = 16px, 5em = 80px
const html = `<body>
<main style='margin-before:3em; margin-after:5em'>
<div style='margin-before:4em'>
<p>text1</p>
<p>text2</p>
<p>text3</p>
</div>
</main>
<article style='margin-before:2em'><p>article</p></article>
</body>`.replace(/\n/g, "");

test("layout offset", () => {
  const doc = new HtmlDocument(html);
  const body = doc.body;
  const main = body.firstChild;
  const div = main!.firstChild;
  const p1 = div!.firstChild;
  const article = main!.nextSibling;
  const p2 = article!.firstChild;
  const children = BlockOffset.getBeforeEdgeElements(main!).map((e: HtmlElement | null) => e ? e.tagName : '');
  expect(children[0]).toBe('main');
  expect(children[1]).toBe('div');
  expect(children[2]).toBe('p');

  expect(BlockOffset.getOffsetFromLastBlock(main!)).toBe(64); // 4em
  expect(BlockOffset.getOffsetFromLastBlock(div!)).toBe(0);
  expect(BlockOffset.getOffsetFromLastBlock(p1!)).toBe(0);
  expect(BlockOffset.getOffsetFromLastBlock(article!)).toBe(80); // 5em
  expect(BlockOffset.getOffsetFromLastBlock(p2!)).toBe(0);
});
