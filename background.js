chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "addLabel",
        title: "Edit label",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "addLabel") {
        chrome.tabs.sendMessage(tab.id, { action: "openLabelDialog" });
    }
});