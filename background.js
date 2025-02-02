chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "addLabel",
        title: "Edit label",
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
    chrome.storage.local.get(selectedText, (data) => {
        const existingLabel = data[selectedText] || "";
        const newLabel = prompt(`Edit label for "${selectedText}"`, existingLabel);

        if (newLabel === null) return; // User canceled

        if (newLabel.trim() === "") {
            // If input is empty, remove the label
            chrome.storage.local.remove(selectedText);
        } else {
            // Otherwise, update storage
            chrome.storage.local.set({ [selectedText]: newLabel.trim() });
        }
    });
}