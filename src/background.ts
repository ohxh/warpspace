//import { Document } from "flexsearch";
import { db } from "./services/Database";
import { attachListeners, initializeTabStore } from "./services/TabStore";

attachListeners();
chrome.runtime.onInstalled.addListener(() => {
  initializeTabStore();
});

chrome.commands.onCommand.addListener(async (c) => {
  console.warn("Got command ", c);
  const match = await chrome.tabs.query({ active: true, currentWindow: true });
  if (match[0]) {
    chrome.tabs.sendMessage(match[0].id!, { type: "enter-warpspace" });
  }
});
