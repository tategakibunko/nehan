// Normally, you can import nehan like following.
// import * as Nehan from "nehan";
import * as Nehan from "../../dist";
import * as SampleDocument from "./sample-document";

//Nehan.Config.debugLayout = true;

let run_reader = (html: string) => {
  let $result = document.getElementById("result");
  let reader = SampleDocument.create(html);
  reader.render({
    onPage: (ctx) => { // called when each page is parsed.
      // At this point, ctx.page.dom is not stored,
      // so you have to call ctx.caller.getPage(ctx.page.index),
      // then ctx.page.dom(same as page.dom in following code) is evaluated.
      const page = ctx.caller.getPage(ctx.page.index); // eval page
      $result.appendChild(page.dom);
      $result.appendChild(document.createElement("hr"));
    },
    onComplete: (ctx) => {
      console.log("finished! %f msec", ctx.time);
      const etor = new Nehan.LayoutOutlineEvaluator(section => {
        let a = document.createElement("a");
        a.innerHTML = section.title;
        a.href = "#" + section.pageIndex;
        a.onclick = () => {
          alert("at page " + section.pageIndex + "!");
        };
        return a;
      });
      const outlineElement = ctx.caller.createOutline(etor);
      document.getElementById("outline").appendChild(outlineElement);
    }
  });
};

document.addEventListener("DOMContentLoaded", (event) => {
  fetch("../sample-text.html").then(response => response.text()).then(html => {
    run_reader(html);
  });
});
