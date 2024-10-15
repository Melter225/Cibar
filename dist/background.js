var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let isCapturing = false;
let intervalId = null;
import { GOOGLE_CLOUD_API_KEY } from "./config.js";
function analyzeImageWithApiKey(base64Image) {
    return __awaiter(this, void 0, void 0, function* () {
        const apiEndpoint = "https://vision.googleapis.com/v1/images:annotate";
        const requestBody = {
            requests: [
                {
                    image: {
                        content: base64Image,
                    },
                    features: [
                        {
                            type: "SAFE_SEARCH_DETECTION",
                        },
                    ],
                },
            ],
        };
        try {
            const response = yield fetch(`${apiEndpoint}?key=${GOOGLE_CLOUD_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            if (!response.ok) {
                const errorText = yield response.text();
                console.error("API Response:", errorText);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }
            const data = yield response.json();
            return data.responses[0].safeSearchAnnotation;
        }
        catch (error) {
            console.error("Error calling Vision API:", error);
            throw error;
        }
    });
}
function analyzeScreenshot(dataUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const base64Image = dataUrl.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
            const detections = yield analyzeImageWithApiKey(base64Image);
            if (detections) {
                if (detections.violence !== "VERY_UNLIKELY" &&
                    detections.adult !== "VERY_UNLIKELY" &&
                    detections.violence !== "UNKNOWN" &&
                    detections.adult !== "UNKNOWN") {
                    let message = "";
                    const severity = Math.max(["UNLIKELY", "POSSIBLE", "LIKELY", "VERY_LIKELY"].indexOf(detections.violence), ["UNLIKELY", "POSSIBLE", "LIKELY", "VERY_LIKELY"].indexOf(detections.adult));
                    switch (severity) {
                        case 0:
                            message =
                                "Cibar has detected some signs that you might be experiencing cyberbullying. Even if it doesn’t feel severe yet, it’s important to take this seriously. Start by documenting any messages or interactions that involve adult or violent content. Consider blocking the person involved and report the content to the platform’s moderators. Stay cautious, and take a break from the platform if you need to.";
                            break;
                        case 1:
                            message =
                                "Cibar has identified that cyberbullying is likely happening. You might be receiving unwanted or inappropriate messages. Don’t engage with the person. Instead, block them, report the behavior, and keep records of the interactions. It's a good idea to reach out to someone you trust for support and take control by adjusting your privacy settings.";
                            break;
                        case 2:
                            message =
                                "Cibar is telling you that cyberbullying is very likely. You might be dealing with repeated, harmful interactions involving adult or violent content. At this point, it’s crucial to block and report the person immediately. Keep evidence of what's happening and, if the content is especially harmful, consider reaching out to law enforcement. Remember, you don’t have to handle this alone.";
                            break;
                        case 3:
                            message =
                                "Cibar has flagged this situation as extremely likely cyberbullying. You may be receiving explicit threats or adult content that’s crossing dangerous lines. It’s vital to stop all contact immediately, block the individual, and report them to the platform and authorities. Take screenshots of everything and get someone you trust involved to help you handle this.";
                            break;
                    }
                    return {
                        message,
                        detections,
                        violence: detections.violence,
                        adult: detections.adult,
                    };
                }
                else {
                    return {
                        message: "No cyberbullying content detected",
                        detections: detections,
                        violence: detections.violence,
                        adult: detections.adult,
                    };
                }
            }
            else {
                return "No detections available";
            }
        }
        catch (error) {
            console.error("Error analyzing screenshot:", error);
            return "Error analyzing image";
        }
    });
}
function startCapturing() {
    if (!isCapturing) {
        isCapturing = true;
        intervalId = setInterval(captureScreen, 10000);
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
            chrome.tabs.captureVisibleTab(activeTab.windowId, { format: "png" }, (dataUrl) => __awaiter(this, void 0, void 0, function* () {
                if (dataUrl) {
                    const analysisResult = yield analyzeScreenshot(dataUrl);
                    console.log("Analysis result:", analysisResult);
                    chrome.runtime.sendMessage({
                        action: "analysisResult",
                        analysisResult,
                    });
                }
            }));
        }
    });
}
chrome.runtime.onInstalled.addListener(() => {
    startCapturing();
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getScreenshots") {
        chrome.storage.local.get(null, (items) => {
            sendResponse(items);
        });
        return true;
    }
});
