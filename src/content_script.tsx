import { Readability } from "@mozilla/readability";
import { debug } from "./services/Logging";
import { ActiveTab } from "./services/SearchIndex";
import { WarpspaceFrameController } from "./content/WarpspaceFrameController";

// window.addEventListener('DOMContentLoaded', (event) => {
//   debug("DOM loaded, attached reader");
//   const res = new Readability(document).parse();

//   console.log(res);
//   document.body.innerHTML = res?.content || "not-found";
// });

const listener = new WarpspaceFrameController(window);


// captureTextContent();

// // window.addEventListener('load', (event) => {
// //   captureTextContent()
// // });

// async function captureTextContent() {
//   const tab = {
//     url: window.location.toString(),
//     title: document.title,
//     content: document.body.innerText,
//   }

//   chrome.runtime.sendMessage({
//     event: "index-content",
//     tab: tab
//   });

//   console.log("Captured text content and sent to master")
// }

// Inject the warpspace frame into the body

debug("Started content script...");

const FrameController = new WarpspaceFrameController(window);

debug("Attached event listeners...")


