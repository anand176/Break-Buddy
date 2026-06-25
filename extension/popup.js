// Break Buddy - popup script

const sitesInput = document.getElementById("sitesInput");
const limitInput = document.getElementById("limitInput");
const breakInput = document.getElementById("breakInput");
const saveBtn = document.getElementById("saveBtn");
const endBreakBtn = document.getElementById("endBreakBtn");
const statusEl = document.getElementById("status");

function hasActiveBreak(all) {
  const now = Date.now();
  return Object.keys(all).some((key) => key.startsWith("breakEnd_") && Number(all[key]) > now);
}

function updateEndBreakButton() {
  chrome.storage.local.get(null, (all) => {
    if (chrome.runtime.lastError) return;
    if (hasActiveBreak(all)) {
      endBreakBtn.classList.remove("hidden");
    } else {
      endBreakBtn.classList.add("hidden");
    }
  });
}

function loadSettings() {
  chrome.storage.local.get(["sites", "limitMinutes", "breakMinutes"], (data) => {
    sitesInput.value = data.sites || "";
    limitInput.value = data.limitMinutes || 10;
    breakInput.value = data.breakMinutes || 5;
  });
  updateEndBreakButton();
}

saveBtn.addEventListener("click", () => {
  const settings = {
    sites: sitesInput.value.trim(),
    limitMinutes: Number(limitInput.value) || 10,
    breakMinutes: Number(breakInput.value) || 5,
  };

  if (!settings.sites) {
    statusEl.style.color = "#f87171";
    statusEl.textContent = "Add at least one site";
    return;
  }

  chrome.storage.local.set(settings, () => {
    if (chrome.runtime.lastError) {
      statusEl.style.color = "#f87171";
      statusEl.textContent = "Save failed: " + chrome.runtime.lastError.message;
      return;
    }
    window.close();
  });
});

endBreakBtn.addEventListener("click", () => {
  chrome.storage.local.get(null, (all) => {
    if (chrome.runtime.lastError) {
      statusEl.style.color = "#f87171";
      statusEl.textContent = "Could not end break.";
      return;
    }

    if (!hasActiveBreak(all)) {
      endBreakBtn.classList.add("hidden");
      statusEl.style.color = "rgba(255,255,255,0.55)";
      statusEl.textContent = "No active break found.";
      setTimeout(() => (statusEl.textContent = ""), 2500);
      return;
    }

    const updates = { endAllBreaks: Date.now() };
    Object.keys(all).forEach((key) => {
      if (key.startsWith("breakEnd_")) {
        updates[key] = 0;
      }
    });

    chrome.storage.local.set(updates, () => {
      if (chrome.runtime.lastError) {
        statusEl.style.color = "#f87171";
        statusEl.textContent = "Could not end break.";
        return;
      }
      endBreakBtn.classList.add("hidden");
      statusEl.style.color = "rgba(255,255,255,0.7)";
      statusEl.textContent = "Break ended. Tab unlocked.";
      setTimeout(() => (statusEl.textContent = ""), 3000);
    });
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  const breakChanged = Object.keys(changes).some(
    (key) => key.startsWith("breakEnd_") || key === "endAllBreaks",
  );
  if (breakChanged) updateEndBreakButton();
});

loadSettings();
setInterval(updateEndBreakButton, 1000);
