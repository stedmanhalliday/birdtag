document.addEventListener("DOMContentLoaded", () => {
  const labelList = document.getElementById("label-list");

  chrome.storage.local.get(null, (labels) => {
    Object.keys(labels).forEach((username) => {
      const item = document.createElement("div");
      item.className = "label-item";
      item.innerHTML = `<span>${username}: ${labels[username]}</span>
                        <button class="remove-btn" data-username="${username}">X</button>`;
      labelList.appendChild(item);
    });

    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const user = e.target.dataset.username;
        chrome.storage.local.remove(user, () => e.target.parentElement.remove());
      });
    });
  });
});