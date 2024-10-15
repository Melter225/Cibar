"use strict";
const CAPTURE_INTERVAL = 10000;
const RESULT_DISPLAY_DURATION = 3000;
let lastUpdateTime = 0;
function updateAnalysisResult(result) {
    const statusElement = document.getElementById("status");
    const resultElement = document.getElementById("analysisResult");
    if (statusElement && resultElement) {
        resultElement.textContent = JSON.stringify(result, null, 2);
        resultElement.style.display = "block";
        statusElement.style.display = "none";
        lastUpdateTime = Date.now();
        setTimeout(() => {
            statusElement.style.display = "block";
            resultElement.style.display = "none";
        }, RESULT_DISPLAY_DURATION);
    }
}
function checkAnalysisStatus() {
    const statusElement = document.getElementById("status");
    const resultElement = document.getElementById("analysisResult");
    if (statusElement && resultElement) {
        const currentTime = Date.now();
        const timeSinceLastUpdate = currentTime - lastUpdateTime;
        if (timeSinceLastUpdate >= CAPTURE_INTERVAL) {
            statusElement.style.display = "block";
            resultElement.style.display = "none";
        }
    }
}
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "analysisResult") {
        updateAnalysisResult(message.result);
    }
});
setInterval(checkAnalysisStatus, 1000);
checkAnalysisStatus();
