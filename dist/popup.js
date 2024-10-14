"use strict";
function updateScreenshots() {
    const screenshotList = document.getElementById("screenshotList");
    if (screenshotList) {
        screenshotList.innerHTML = ""; // Clear existing screenshots
        chrome.runtime.sendMessage({ action: "getScreenshots" }, (response) => {
            if (response) {
                const timestamps = Object.keys(response).sort().reverse(); // Sort timestamps in reverse order
                timestamps.forEach((timestamp) => {
                    const img = document.createElement("img");
                    img.src = response[timestamp];
                    img.style.width = "200px"; // Adjust size as needed
                    screenshotList.appendChild(img);
                });
            }
        });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    // Initial update of screenshots when popup opens
    updateScreenshots();
});
// Listen for new screenshots
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "screenshotTaken") {
        updateScreenshots();
    }
});
