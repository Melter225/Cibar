let popupIsCapturing = false;
const toggleButton = document.getElementById(
  "toggleButton"
) as HTMLButtonElement;

toggleButton.addEventListener("click", () => {
  popupIsCapturing = !popupIsCapturing;
  toggleButton.textContent = popupIsCapturing
    ? "Stop Capturing"
    : "Start Capturing";
  chrome.runtime.sendMessage(
    { action: "toggleCapture", isCapturing: popupIsCapturing },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
      } else {
        console.log("Message sent successfully", response);
      }
    }
  );
});
