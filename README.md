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

## About logical size

To handle documents that are independent of the character direction, we use the `logical size`.

- `measure` means the size in the inline direction.
- `extent` means the size in the block direction.

### logical-size - physical-size table

| logical-size\writing-mode | horizontal-tb | vertical-rl   | vertical-lr   |
| ------------------------- | ------------- | ------------- | ------------- |
| measure                   | width         | height        | height        |
| extent                    | height        | width         | width         |

## About logical direction

To handle documents that are independent of the character direction, we use the `logical direction`.

- `start` means inline level heading direction.
- `end` means inline level trailing direction.
- `before` measn block level heading direction.
- `after` means block level trailing direction.

#### Example1 (logical-margin - physical-margin table)

| logical-direction\writing-mode | horizontal-tb | vertical-rl   | vertical-lr   |
| ------------------------------ | ------------- | ------------- | ------------- |
| margin-start                   | margin-left   | margin-top    | margin-top    |
| margin-end                     | margin-right  | margin-bottom | margin-bottom |
| margin-before                  | margin-top    | margin-right  | margin-left   |
| margin-after                   | margin-bottom | margin-left   | margin-right  |

The same is true for `padding` and `border`(`border-xxx-width`, `border-xxx-color`, `border-xxx-style`).

#### Example2 (logical-border-radius - physical-border-radius table)

| logical-direction\writing-mode | horizontal-tb | vertical-rl   | vertical-lr   |
| ------------------------------ | ------------- | ------------- | ------------- |
| border-before-start-radius     | border-top-left-radius  | border-top-right-radius    | border-top-left-radius    |
| border-before-end-radius     | border-top-right-radius  | border-bottom-right-radius    | border-bottom-left-radius    |
| border-after-end-radius     | border-bottom-right-radius  | border-bottom-left-radius    | border-bottom-right-radius    |
| border-after-start-radius     | border-bottom-left-radius  | border-top-left-radius    | border-top-right-radius    |

### Shothanded logical property

If you set `margin` like `margin:1em 2em 3em 4em`, then it means `margin-before:1em`, `margin-end:2em`, `margin-after:3em`, `margin-start:4em`.

If you set `margin` like `margin:1em 2em 3em`, then it means `margin-before:1em`, `margin-end:2em`, `margin-after:3em`, `margin-start:2em`.

If you set `margin` like `margin:1em 2em`, then it means `margin-before:1em`, `margin-end:2em`, `margin-after:1em`, `margin-start:2em`.

If you set `margin` like `margin:1em`, then it means `margin-before:1em`, `margin-end:1em`, `margin-after:1em`, `margin-start:1em`.

The same is true for `padding` and `border`(`border-xxx-width`, `border-xxx-color`, `border-xxx-style`).

## Dynamic Style

You can define functional value for each selector.

In following example, all elements that matches `.require-xx` will cause page-break if rest block size(restExtent) is smaller than `xx`px.

```typescript
function requiredExtent(ctx: DynamicStyleContext): CssDeclarationBlock | undefined {
  const requiredSize = parseInt(ctx.selector.replace(/\.require-(\d+)/, (m, px) => px), 0);
  if(isNaN(requiredSize)){
    return undefined;
  }
  if(!ctx.parentContext){
    return undefined;
  }
  const restExtent = ctx.parentContext.restExtent;
  if(restExtent >= requiredSize){
    return undefined; // enough block size is left!
  }
  // restExtent < requiredSize(not enough block size left)
  return {"pageb-break-before": "always"};
}

const myStyleSheet = new CssStyleSheet({
  ".require-60": {
    "!dynamic": (ctx: DynamicStyleContext) => requiredExtent(ctx)
  }
});
```

## DOM generation hook

You can define dom generation hook for each selector element like this.

```typescript
const myStyleSheet = new CssStyleSheet({
  ".foo": {
    "@create": (ctx: DomCallbackContext): HTMLElement => {
      ctx.dom.onclick = (e) => {
        alert(`${ctx.selector} is clicked!`); // .foo is clicked!
      };
    }
  }
});
```

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
