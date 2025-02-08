// Store the last right-clicked element
document.addEventListener("contextmenu", (event) => {
    window.lastRightClickedElement = event.target;
});

// Listen for background.js messages
chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "openLabelDialog") {
        const clickedElement = window.lastRightClickedElement;
        if (!clickedElement) return;

        // Find the correct div containing the username
        const userNameDiv = clickedElement.closest('div[data-testid="User-Name"]');
        if (!userNameDiv) return;

        // Select the second <a role="link"> inside the username div
        const links = userNameDiv.querySelectorAll('a[role="link"]');
        if (links.length < 2) return; // Ensure there are at least two links

        const usernameElement = links[1]; // Grab the second link
        const username = usernameElement.innerText.trim();

        // Open edit label prompt
        chrome.storage.local.get(username, (data) => {
            const existingLabel = data[username] || "";
            const newLabel = prompt(`Edit label for "${username}"`, existingLabel);

            if (newLabel === null) return; // User canceled

            if (newLabel.trim() === "") {
                chrome.storage.local.remove(username, refreshLabels);
            } else {
                chrome.storage.local.set({ [username]: newLabel.trim() }, refreshLabels);
            }
        });
    }
});

// Refresh labels in the DOM
function refreshLabels() {
    chrome.storage.local.get(null, (labels) => {
        document.querySelectorAll('div[data-testid="User-Name"]').forEach((userNameDiv) => {
            const links = userNameDiv.querySelectorAll('a[role="link"]');
            if (links.length < 2) return; // Ensure second <a> exists

            const usernameElement = links[1];
            const username = usernameElement.innerText.trim();

            // Check if a label already exists
            let existingTag = userNameDiv.querySelector(".birdtag-label");

            if (labels[username]) {
                if (existingTag) {
                    // Update existing label instead of adding a new one
                    existingTag.innerText = ` ${labels[username]}`;
                } else {
                    let labelTag = document.createElement("span");
                    labelTag.innerText = ` ${labels[username]}`;
                    labelTag.classList.add("birdtag-label");
                    labelTag.style.backgroundColor = "#1d9bf0";
                    labelTag.style.color = "#fff";
                    labelTag.style.padding = "2px 8px";
                    labelTag.style.marginLeft = "6px";
                    labelTag.style.borderRadius = "2px";
                    labelTag.style.fontSize = "13px";
                    labelTag.style.fontWeight = "500";
                    labelTag.style.display = "inline-block";
                    labelTag.style.cursor = "pointer";

                    labelTag.onclick = () => {
                        const newLabel = prompt(`Edit label for "${username}"`, labels[username]);
                        if (newLabel === "") {
                            chrome.storage.local.remove(username, refreshLabels);
                        } else if (newLabel) {
                            chrome.storage.local.set({ [username]: newLabel }, refreshLabels);
                        }
                    };

                    let wrapper = document.createElement('div');
                    wrapper.appendChild(labelTag);
                    userNameDiv.prepend(wrapper); // Prevents inserting multiple labels
                }
            } else if (existingTag) {
                existingTag.remove();
            }
        });
    });
}

// Observe new tweets dynamically
const observer = new MutationObserver(() => {
    refreshLabels();
});

observer.observe(document.body, { childList: true, subtree: true });

// Run label injection on load
refreshLabels();