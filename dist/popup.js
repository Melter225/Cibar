"use strict";
// src/popup.ts
// Select the button in the popup
const button = document.getElementById("changeColor");
// Set up an event listener for the button click
button === null || button === void 0 ? void 0 : button.addEventListener("click", () => {
    // Define the color you want to change to
    const color = "lightgreen";
    // Send a message to the background script to change the color
    chrome.runtime.sendMessage({ action: "changeColor", color });
});
