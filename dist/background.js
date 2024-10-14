"use strict";
let isCapturing = false;
let intervalId = null;
function startCapturing() {
    if (!isCapturing) {
        isCapturing = true;
        intervalId = setInterval(captureScreen, 5000); // Capture every 5 seconds
    }
}
function stopCapturing() {
    if (isCapturing && intervalId !== null) {
        clearInterval(intervalId);
        isCapturing = false;
    }
}
function captureScreen() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
            chrome.tabs.captureVisibleTab(activeTab.windowId, { format: "png" }, (dataUrl) => {
                if (dataUrl) {
                    const timestamp = new Date().toISOString();
                    chrome.storage.local.set({ [timestamp]: dataUrl }, () => {
                        console.log("Screenshot saved:", timestamp);
                        chrome.runtime.sendMessage({ action: "screenshotTaken" });
                    });
                }
            });
        }
    });
}
// Start capturing when the extension is loaded
chrome.runtime.onInstalled.addListener(() => {
    startCapturing();
});
// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getScreenshots") {
        chrome.storage.local.get(null, (items) => {
            sendResponse(items);
        });
        return true; // Indicates an asynchronous response
    }
});
