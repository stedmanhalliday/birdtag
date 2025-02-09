// store context menu target
document.addEventListener("contextmenu", (event) => {
    window.contextElement = event.target;
});

// listen for background.js messages
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "openLabelDialog") {
        const clickedElement = window.contextElement;
        if (!clickedElement) return;

        // username container
        const userNameDiv = clickedElement.closest('div[data-testid="User-Name"]');
        if (!userNameDiv) return;

        // username links
        const links = userNameDiv.querySelectorAll('a[role="link"]');
        if (links.length < 2) return;   // validate display name + username links present

        const usernameElement = links[1];   // username link
        const username = usernameElement.innerText.trim();

        // edit label dialog
        chrome.storage.local.get(username, (data) => {
            const existingLabel = data[username] || "";
            const newLabel = prompt(`Edit label for "${username}"`, existingLabel);

            // canceled dialog
            if (newLabel === null) return;

            if (newLabel.trim() === "") {
                // remove empty label
                chrome.storage.local.remove(username, refreshLabels);
            } else {
                // set new label
                chrome.storage.local.set({ [username]: newLabel.trim() }, refreshLabels);
            }
        });
    }
});

// refresh label tags in DOM
function refreshLabels() {
    chrome.storage.local.get(null, (labels) => {
        document.querySelectorAll('div[data-testid="User-Name"]').forEach((userNameDiv) => {
            const links = userNameDiv.querySelectorAll('a[role="link"]');
            if (links.length < 2) return;   // validate display name + username links present

            const usernameElement = links[1];   // username link
            const username = usernameElement.innerText.trim();

            // tag exists check
            let existingTag = userNameDiv.parentElement.querySelector(".birdtag-label");

            if (labels[username]) {
                if (existingTag) {
                    // update existing tag
                    existingTag.innerText = ` ${labels[username]}`;
                } else {
                    // create new tag
                    let labelTag = document.createElement("span");
                    labelTag.innerText = ` ${labels[username]}`;
                    labelTag.classList.add("birdtag-label");
                    labelTag.style.display = "inline-block";
                    labelTag.style.backgroundColor = "#1d9bf0";
                    labelTag.style.color = "#fff";
                    labelTag.style.padding = "2px 8px";
                    labelTag.style.marginBottom = "4px";
                    labelTag.style.borderRadius = "2px";
                    labelTag.style.fontSize = "13px";
                    labelTag.style.fontFamily = 'TwitterChirp, -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
                    labelTag.style.fontWeight = "500";
                    labelTag.style.lineHeight = "15px";
                    labelTag.style.cursor = "pointer";

                    // edit label dialog
                    labelTag.onclick = () => {
                        const newLabel = prompt(`Edit label for "${username}"`, labels[username]);
                        if (newLabel === "") {
                            chrome.storage.local.remove(username, refreshLabels);
                        } else if (newLabel) {
                            chrome.storage.local.set({ [username]: newLabel }, refreshLabels);
                        }
                    };

                    // insert tag into DOM
                    let wrapper = document.createElement('div');
                    wrapper.appendChild(labelTag);
                    userNameDiv.parentElement.prepend(wrapper);
                }
            } else if (existingTag) {
                // remove existing tag
                existingTag.remove();
            }
        });
    });
}

// observe new posts dynamically
const observer = new MutationObserver(() => {
    refreshLabels();
});

observer.observe(document.body, { childList: true, subtree: true });

// inject labels onload
refreshLabels();