# nehan

## Introduction

Html layout engine for paged-media written by [Typescript](https://www.typescriptlang.org/).

## Install

```
npm install nehan
```

## Example

See [example](https://github.com/tategakibunko/nehan/tree/master/example) directory.

## Usage

### simple usage with no styling

```typescript
import { PagedHtmlDocument } from 'nehan';

const $result = document.querySelector("#result");

new PagedHtmlDocument("<h1>hello, nehan!</h1>", {}).render({
  onPage: (ctx) => {
    const evaluatedPage = ctx.caller.getPage(ctx.page.index);
    $result.appendChild(evaluatedPage.dom);
    $result.appendChild(document.createElement("hr"));
  },
  onComplete: (ctx) => {
    console.log(`finished! ${ctx.time}msec`);
  }
});
```

### render with style

```typescript
import { PagedHtmlDocument, CssStyleSheet } from 'nehan';

const $result = document.querySelector("#result");

new PagedHtmlDocument("<h1>hello, nehan!</h1>", {
  styleSheets:[
    new CssStyleSheet({
      "body":{
        writihgMode:"horizontal-tb", // or "vertical-rl"
        fontSize:"16px",
        padding: "1em",
        measure: "640px", // means 'width' in horizontal-tb, 'height' in vertical-rl.
        extent: "480px"   // means 'height' in horizontal-tb, 'width' in vertical-rl.
      },
      "h1":{
        marginAfter: "1em",   // means 'margin-bottom' in horizontal-tb, 'margin-left' in vertical-rl
        paddingStart: "0.5em" // means 'padding-left' in horizontal-tb, 'padding-top' in vertical-rl
      }
    }
  ]
}).render({
  onPage: (ctx) => {
    const evaluatedPage = ctx.caller.getPage(ctx.page.index);
    $result.appendChild(evaluatedPage.dom);
    $result.appendChild(document.createElement("hr"));
  },
  onComplete: (ctx) => {
    console.log(`finished! ${ctx.time}msec`);
  }
});
```

## About logical direction

### logical direction(`start` and `end`)

`start` means inline level heading direction, `end` means inline level trailing direction. So if you choose `horizontal-tb` as `writing-mode`, `margin-start` means `margin-left`, and `margin-end` means `margin-right`.

### logical directoin(`before` and `after`)

`before` measn block level heading direction, `after` means block level trailing direction. So if you choose `horizontal-tb` as `writing-mode`, `margin-before` means `margin-top`, and `margin-after` means `margin-bottom`.

### shothanded logical property

If you set `margin` like `margin:1em 2em 3em 4em`, then it means `margin-before:1em`, `margin-end:2em`, `margin-after:3em`, `margin-start:4em`.

If you set `margin` like `margin:1em 2em 3em`, then it means `margin-before:1em`, `margin-end:2em`, `margin-after:3em`, `margin-start:2em`.

If you set `margin` like `margin:1em 2em`, then it means `margin-before:1em`, `margin-end:2em`, `margin-after:1em`, `margin-start:2em`.

If you set `margin` like `margin:1em`, then it means `margin-before:1em`, `margin-end:1em`, `margin-after:1em`, `margin-start:1em`.

## Demo

[Nehan Reader](https://chrome.google.com/webstore/detail/nehan-reader/bebbekgiffjpgjlgkkhmlgheckolmdcf?hl=ja) at Chrome Web Store.

### How to use

1. Install [Nehan Reader](https://chrome.google.com/webstore/detail/nehan-reader/bebbekgiffjpgjlgkkhmlgheckolmdcf?hl=ja).
2. Goto any site you want to read as paged-media.
3. Click the browser action button <img src="https://raw.github.com/tategakibunko/nehan/master/example/images/nehan-reader-48.png" width="32" height="32" />
4. Then you'll see paged site.

## Development

`npm run build` and library is generated in `dist` directory.

## License

MIT
