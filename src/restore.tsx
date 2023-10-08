chrome.runtime.onMessage.addListener((message, sender) => {
  window.location.replace(message)
})