function addLabelsToUsernames() {
    console.log("Running addLabelsToUsernames");

    chrome.storage.local.get(null, (labels) => {
        document.querySelectorAll('div[data-testid="User-Name"] a[role="link"]').forEach((nameElement) => {
            // const username = nameElement.childNodes[0].nodeValue.trim(); 
            const username = nameElement.innerText.trim();

            if (labels[username] && !nameElement.dataset.labeled) {
                console.log(`Adding label for ${username}`);

                let labelTag = document.createElement("span");
                labelTag.innerText = ` ${labels[username]}`;
                labelTag.style.backgroundColor = "#1d9bf0";
                labelTag.style.color = "#fff";
                labelTag.style.padding = "2px 8px";
                labelTag.style.marginBottom = "4px";
                labelTag.style.borderRadius = "2px";
                labelTag.style.fontSize = "13px";
                labelTag.style.fontFamily = 'TwitterChirp, -apple-system, "system-ui", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
                labelTag.style.fontWeight = "500";
                labelTag.style.lineHeight = "15px";
                labelTag.style.display = "inline-block";
                labelTag.style.cursor = "pointer";

                labelTag.onclick = () => {
                    const newLabel = prompt(`Edit label for "${username}"`, labels[username]);
                    if (newLabel === "") {
                        chrome.storage.local.remove(username);
                        labelTag.remove();
                    } else if (newLabel) {
                        chrome.storage.local.set({ [username]: newLabel }, () => {
                            labelTag.innerText = ` ${newLabel}`;
                        });
                    }
                };
                
                let wrapper = document.createElement('div');
                wrapper.appendChild(labelTag);
                nameElement.closest('div[data-testid="User-Name"]').parentElement.prepend(wrapper);
                nameElement.dataset.labeled = "true";
            }
        });
    });
}

// Ensure mutation observer works
const observer = new MutationObserver(() => {
    console.log("Mutation detected, updating labels");
    addLabelsToUsernames();
});

observer.observe(document.body, { childList: true, subtree: true });

// Run the function once on load
addLabelsToUsernames();