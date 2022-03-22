//import { Document } from "flexsearch";
import { db } from "./services/Database";
import { ImageStore } from "./services/ImageStore";
import { TabStore } from "./services/TabStore";

const imageStore = new ImageStore();
const store = new TabStore(imageStore);

store.getInitialData();

store.stateChanged.addListener(() => {
  chrome.runtime.sendMessage(store.state);
});

db.windows.clear();
db.visits.clear();
db.pages.clear();

chrome.commands.onCommand.addListener(async (c) => {
  console.warn("Got command ", c);
  const match = await chrome.tabs.query({ active: true, currentWindow: true });
  if (match[0]) {
    chrome.tabs.sendMessage(match[0].id!, { type: "enter-warpspace" });
  }
});
//

// Separate index for open tabs as they can have URL dupes...
// OR: index allows multiple visits with same URL.

// Active page / window record (write through to dexie)

// Dexie DBs:

// Windows (named / unnamed)
// Past visits (active w/ page info, write through to pages)
// Pages

// Flexsearch indexes:
// L1: Title, Description, URL, Body
// L2: Title, Description, URL, Body
// L3: Title, Description, URL
// L4: Title, Description, URL

// L1: Metadata, photo, content, metadata prefix search, content body context / prefix search
// - All open tabs (~500)

// L2: Metadata, photo, content, metadata prefix search, body search
// - Anything in a named window, anything commonly searched

// L3: Metadata, photo, metadata prefix search
// - Everything else, as long as it fits

// L4: Metadata
// - Whatever doesn't fit

// Blacklist:
// - Search results

// Index new tabs and mark which indexings are "dirty" -- on failure, redo those from saved content

// const L1 = new Document({
//   document: {
//     id: "id",
//     index: [
//       {
//         field: "title",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 9,
//       },
//       {
//         field: "url",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 9,
//       },
//       {
//         field: "description",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 9,
//       },
//       {
//         field: "content",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 5,
//       },
//     ],
//   },
// });

// const L2 = new Document({
//   document: {
//     id: "id",
//     index: [
//       {
//         field: "title",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 9,
//       },
//       {
//         field: "url",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 9,
//       },
//       {
//         field: "description",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 9,
//       },
//       {
//         field: "content",
//         tokenize: "strict",
//         optimize: true,
//         resolution: 5,
//       },
//     ],
//   },
// });

// const L3 = new Document({
//   document: {
//     id: "id",
//     index: [
//       {
//         field: "title",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 9,
//       },
//       {
//         field: "url",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 9,
//       },
//       {
//         field: "description",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 9,
//       },
//     ],
//   },
// });

// const L4 = new Document({
//   document: {
//     id: "id",
//     index: [
//       {
//         field: "title",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 9,
//       },
//       {
//         field: "url",
//         tokenize: "forward",
//         optimize: true,
//         resolution: 9,
//       },
//     ],
//   },
// });
