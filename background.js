chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "addLabel",
        title: "Add label",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "addLabel") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) return; // no active tab
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: openLabelDialog,
                args: [info.selectionText]
            });
        });
    }
});

function openLabelDialog(selectedText) {
    const label = prompt(`Enter label for "${selectedText}"`, "");
    if (label && label.length <= 21) {
        chrome.storage.local.set({ [selectedText]: label });
    }
}