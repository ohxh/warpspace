//import { Document } from "flexsearch";
import { db } from "./services/Database";
import { initializeTabStore } from "./services/TabStore";

db.windows.clear();
db.visits.clear();
db.pages.clear();

initializeTabStore();

chrome.commands.onCommand.addListener(async (c) => {
  console.warn("Got command ", c);
  const match = await chrome.tabs.query({ active: true, currentWindow: true });
  if (match[0]) {
    chrome.tabs.sendMessage(match[0].id!, { type: "enter-warpspace" });
  }
});
