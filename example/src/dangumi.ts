import * as Nehan from "nehan";
import * as SampleReader from "./sample-reader";

//Nehan.Config.debugLayout = true;

let run_reader = (html: string) => {
  let $result = document.getElementById("result");
  let reader = SampleReader.create(html);
  reader.render({
    onPage:(reader, page) => { // called when each page is generated.
      $result.appendChild(page.dom);
      $result.appendChild(document.createElement("hr"));
    },
    onCompletePage:(reader, time) => {
      console.log("finished! %f msec", time);
      let outline = reader.createOutlineElement({
	onSection:(section) => {
	  let a = document.createElement("a");
	  a.innerHTML = section.title;
	  a.href = "#" + section.pageIndex;
	  a.onclick = () => {
	    alert("at page " + section.pageIndex + "!");
	  };
	  return a;
	}
      });
      document.getElementById("outline").appendChild(outline);
    }
  });
};

document.addEventListener("DOMContentLoaded", (event) => {
  fetch("../sample-text.html").then(response => response.text()).then(html => {
    run_reader(html);
  });
});
