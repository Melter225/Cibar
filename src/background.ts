let backgroundIsCapturing = false;
let intervalId: number | null = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message);
  if (message.action === "toggleCapture") {
    backgroundIsCapturing = message.isCapturing;
    console.log("Capturing state:", backgroundIsCapturing);
    if (backgroundIsCapturing) {
      startCapturing();
    } else {
      stopCapturing();
    }
    sendResponse({ success: true });
  }
  return true;
});

function startCapturing() {
  intervalId = setInterval(captureScreen, 5000);
}

function stopCapturing() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function captureScreen() {
  chrome.windows.getCurrent((window) => {
    if (window.id !== undefined) {
      chrome.tabs.captureVisibleTab(window.id, { format: "png" }, (dataUrl) => {
        if (dataUrl) {
          const timestamp = new Date().toISOString();
          // Store the screenshot data in chrome.storage.local
          chrome.storage.local.set({ [timestamp]: dataUrl }, () => {
            console.log("Screenshot saved:", timestamp);
            processScreenshot(dataUrl);
          });
        }
      });
    }
  });
}

function processScreenshot(dataUrl: string) {
  console.log("Processing screenshot...");
}
