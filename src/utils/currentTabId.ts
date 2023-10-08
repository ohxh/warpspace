export let currentTabId = 0;

chrome.tabs.getCurrent((c) => (currentTabId = c!.id!));
