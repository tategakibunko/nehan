// Normally, you can import nehan like following.
// import * as Nehan from "nehan";
import * as Nehan from "../../dist";
import * as SampleReader from "./sample-document";

//Nehan.Config.debugLayout = true;

class Pager {
  public pageIndex: number;
  public pageCount: number;

  constructor() {
    this.pageIndex = 0;
    this.pageCount = 0;
  }

  public toString(): string {
    return `${this.pageIndex + 1} / ${this.pageCount}`;
  }

  public incPageCount(): number {
    this.pageCount++;
    return this.pageCount;
  }

  public incPageIndex(): number {
    this.pageIndex = Math.min(this.pageIndex + 1, Math.max(0, this.pageCount - 1));
    return this.pageIndex;
  }

  public decPageIndex(): number {
    this.pageIndex = Math.max(0, this.pageIndex - 1);
    return this.pageIndex;
  }
};

let run_reader = (html: string) => {
  let $result = document.getElementById("result");
  let $nombre = document.getElementById("nombre");
  let reader = SampleReader.create(html);
  let pager: Pager = new Pager();

  let update_nombre = () => {
    $nombre.innerHTML = pager.toString();
  };

  let goto_page = (index: number) => {
    let page = reader.getPage(index);
    $result.replaceChild(page.dom, $result.firstChild);
    update_nombre();
  };

  reader.render({
    onPage: (ctx) => { // called when each page is generated.
      if (ctx.page.index === 0) {
        const page = ctx.caller.getPage(ctx.page.index);
        $result.appendChild(page.dom);
      }
      pager.incPageCount();
      update_nombre();
    },
    onComplete: (ctx) => {
      console.log("finished! %f msec", ctx.time);
      const etor = new Nehan.LayoutOutlineEvaluator(section => {
        let a = document.createElement("a");
        a.innerHTML = section.title;
        a.href = "#" + section.pageIndex;
        a.onclick = () => {
          goto_page(section.pageIndex);
        };
        return a;
      });
      const outlineElement = ctx.caller.createOutline(etor);
      document.getElementById("outline").appendChild(outlineElement);
    }
  });

  // setup pager
  document.getElementById("next").onclick = () => {
    let page_index = pager.incPageIndex();
    goto_page(page_index);
  };

  document.getElementById("prev").onclick = () => {
    let page_index = pager.decPageIndex();
    goto_page(page_index);
  };
};

document.addEventListener("DOMContentLoaded", (event) => {
  fetch("../sample-text.html").then(response => response.text()).then(html => {
    run_reader(html);
  });
});
