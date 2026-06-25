// Break Buddy - content script
// Runs on every page, but only does anything on sites the user added in settings.

(function () {
  const STORAGE_KEYS = ["sites", "limitMinutes", "breakMinutes"];
  const SCRUB_SENSITIVITY = 0.8;
  const PARALLAX_TRANSLATE_X = 36;
  const PARALLAX_TRANSLATE_Y = 24;
  const PARALLAX_OBJECT_SHIFT = 11;
  const VIDEO_SCALE = 1.12;

  let settings = null;
  let trackTimer = null;
  let breakTimer = null;
  let overlayActive = false;
  let activeBreak = null;

  function extensionAlive() {
    try {
      return Boolean(chrome?.runtime?.id && chrome?.storage?.local);
    } catch {
      return false;
    }
  }

  function stopAll() {
    if (trackTimer) clearInterval(trackTimer);
    if (breakTimer) clearInterval(breakTimer);
    trackTimer = null;
    breakTimer = null;
  }

  function storageGet(keys, callback) {
    if (!extensionAlive()) {
      stopAll();
      return;
    }

    chrome.storage.local.get(keys, (data) => {
      if (chrome.runtime.lastError || !extensionAlive()) {
        stopAll();
        return;
      }
      callback(data);
    });
  }

  function storageSet(values, callback) {
    if (!extensionAlive()) {
      stopAll();
      return;
    }

    chrome.storage.local.set(values, () => {
      if (chrome.runtime.lastError || !extensionAlive()) {
        stopAll();
        return;
      }
      if (callback) callback();
    });
  }

  function assetUrl(path) {
    if (!extensionAlive()) return "";
    return chrome.runtime.getURL(path);
  }

  function getHostname() {
    return location.hostname.replace(/^www\./, "").toLowerCase();
  }

  function hostMatches(hostname, list) {
    return list.some((s) => hostname === s || hostname.endsWith("." + s));
  }

  function parseSites(raw) {
    return (raw || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  function formatCountdown(totalSeconds) {
    const clamped = Math.max(0, Math.ceil(totalSeconds));
    const minutes = Math.floor(clamped / 60);
    const seconds = clamped % 60;
    return {
      line1: String(minutes).padStart(2, "0"),
      line2: String(seconds).padStart(2, "0"),
    };
  }

  function init() {
    if (!extensionAlive()) return;

    storageGet(STORAGE_KEYS, (data) => {
      settings = {
        sites: parseSites(data.sites),
        limitMinutes: Number(data.limitMinutes) || 10,
        breakMinutes: Number(data.breakMinutes) || 5,
      };

      if (settings.sites.length === 0) return;

      const hostname = getHostname();
      if (!hostMatches(hostname, settings.sites)) return;

      const elapsedKey = "elapsed_" + hostname;
      const breakEndKey = "breakEnd_" + hostname;

      storageGet([elapsedKey, breakEndKey], (res) => {
        const now = Date.now();
        const breakEnd = res[breakEndKey] || 0;

        if (breakEnd > now) {
          const remaining = Math.ceil((breakEnd - now) / 1000);
          showBreakScreen(remaining, settings.breakMinutes * 60, hostname, elapsedKey, breakEndKey);
          return;
        }

        if (breakEnd && breakEnd <= now) {
          storageSet({ [elapsedKey]: 0, [breakEndKey]: 0 }, () => {
            startTracking(0, hostname, elapsedKey, breakEndKey);
          });
          return;
        }

        const elapsedSeconds = Number(res[elapsedKey]) || 0;
        if (elapsedSeconds >= settings.limitMinutes * 60) {
          const breakEndTime = now + settings.breakMinutes * 60 * 1000;
          storageSet({ [breakEndKey]: breakEndTime }, () => {
            showBreakScreen(settings.breakMinutes * 60, settings.breakMinutes * 60, hostname, elapsedKey, breakEndKey);
          });
        } else {
          startTracking(elapsedSeconds, hostname, elapsedKey, breakEndKey);
        }
      });
    });
  }

  function startTracking(startSeconds, hostname, elapsedKey, breakEndKey) {
    let elapsedSeconds = startSeconds;
    trackTimer = setInterval(() => {
      if (!extensionAlive()) {
        stopAll();
        return;
      }

      if (document.visibilityState === "visible" && document.hasFocus()) {
        elapsedSeconds += 1;
        storageSet({ [elapsedKey]: elapsedSeconds });

        if (elapsedSeconds >= settings.limitMinutes * 60) {
          clearInterval(trackTimer);
          trackTimer = null;
          const breakEndTime = Date.now() + settings.breakMinutes * 60 * 1000;
          storageSet({ [breakEndKey]: breakEndTime }, () => {
            showBreakScreen(settings.breakMinutes * 60, settings.breakMinutes * 60, hostname, elapsedKey, breakEndKey);
          });
        }
      }
    }, 1000);
  }

  function injectOverlayStyles() {
    if (document.getElementById("__break_buddy_styles__")) return;
    const href = assetUrl("overlay.css");
    if (!href) return;

    const link = document.createElement("link");
    link.id = "__break_buddy_styles__";
    link.rel = "stylesheet";
    link.href = href;
    document.documentElement.appendChild(link);
  }

  function setupVideoScrub(video, overlay) {
    let targetTime = 0;
    let seeking = false;

    function requestSeek() {
      if (!Number.isFinite(video.duration) || seeking) return;
      seeking = true;
      video.currentTime = Math.min(Math.max(targetTime, 0), video.duration);
    }

    function followCursor(clientX, clientY) {
      const nx = clientX / window.innerWidth - 0.5;
      const ny = clientY / window.innerHeight - 0.5;
      const tx = nx * PARALLAX_TRANSLATE_X * 2;
      const ty = ny * PARALLAX_TRANSLATE_Y * 2;
      const posX = 50 + nx * PARALLAX_OBJECT_SHIFT * 2;
      const posY = 50 + ny * PARALLAX_OBJECT_SHIFT * 2;

      video.style.transform = "translate(" + tx + "px, " + ty + "px) scale(" + VIDEO_SCALE + ")";
      video.style.objectPosition = posX + "% " + posY + "%";
    }

    video.addEventListener("loadedmetadata", () => {
      video.pause();
      video.currentTime = 0;
      targetTime = 0;
    });

    video.addEventListener("seeked", () => {
      seeking = false;
      if (Math.abs(video.currentTime - targetTime) > 0.03) {
        requestSeek();
      }
    });

    overlay.addEventListener("mousemove", (event) => {
      followCursor(event.clientX, event.clientY);

      if (!Number.isFinite(video.duration) || video.duration === 0) return;
      const deltaSeconds = (event.movementX / window.innerWidth) * video.duration * SCRUB_SENSITIVITY;
      targetTime = Math.min(Math.max(targetTime + deltaSeconds, 0), video.duration);
      requestSeek();
    });

    overlay.addEventListener("mouseleave", () => {
      video.style.transform = "translate(0px, 0px) scale(" + VIDEO_SCALE + ")";
      video.style.objectPosition = "50% 50%";
    });
  }

  function updateCountdown(countMinEl, countSecEl, progressEl, secondsLeft, totalSeconds) {
    const { line1, line2 } = formatCountdown(secondsLeft);
    countMinEl.textContent = line1;
    countSecEl.textContent = line2;
    const progress = Math.min(Math.max(secondsLeft / totalSeconds, 0), 1);
    progressEl.style.transform = "scaleX(" + progress + ")";
  }

  function showBreakScreen(breakSeconds, totalBreakSeconds, hostname, elapsedKey, breakEndKey) {
    if (overlayActive || !extensionAlive()) return;
    overlayActive = true;
    activeBreak = { hostname, elapsedKey, breakEndKey };
    if (trackTimer) clearInterval(trackTimer);
    trackTimer = null;

    injectOverlayStyles();

    const overlay = document.createElement("div");
    overlay.id = "__break_buddy_overlay__";

    const videoStage = document.createElement("div");
    videoStage.className = "bb-video-stage";

    const video = document.createElement("video");
    video.className = "bb-video";
    video.src = assetUrl("assets/hero.mp4");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    videoStage.appendChild(video);

    const dim = document.createElement("div");
    dim.className = "bb-dim";

    const grid = document.createElement("div");
    grid.className = "bb-grid";

    const watermark = document.createElement("div");
    watermark.className = "bb-watermark";
    watermark.textContent = "REST";

    const nav = document.createElement("nav");
    nav.className = "bb-nav";
    nav.innerHTML =
      '<div class="bb-nav-left">' +
      '<div class="bb-nav-pill">' +
      '<svg class="bb-logo" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="5" height="18" rx="2.5"/><rect x="15" y="3" width="5" height="18" rx="2.5"/></svg>' +
      "<span>Break Buddy</span>" +
      "</div>" +
      "</div>" +
      '<div class="bb-nav-badge">Break active</div>';

    const content = document.createElement("div");
    content.className = "bb-content";

    const spacer = document.createElement("div");
    spacer.className = "bb-spacer";

    const bottom = document.createElement("div");
    bottom.className = "bb-bottom";

    const left = document.createElement("div");
    left.className = "bb-left";

    const heading = document.createElement("h1");
    heading.className = "bb-heading";
    heading.innerHTML = "Take A<br>Break";

    const desc = document.createElement("p");
    desc.className = "bb-desc";
    desc.textContent =
      "You have been browsing long enough. Step away, reset your focus, and come back when the timer reaches zero.";

    left.appendChild(heading);
    left.appendChild(desc);

    const right = document.createElement("div");
    right.className = "bb-right";

    const countdown = document.createElement("h2");
    countdown.className = "bb-countdown";
    const countMin = document.createElement("span");
    countMin.className = "bb-count-min";
    const countSec = document.createElement("span");
    countSec.className = "bb-count-sec";
    countdown.appendChild(countMin);
    countdown.appendChild(document.createElement("br"));
    countdown.appendChild(countSec);

    const countLabel = document.createElement("div");
    countLabel.className = "bb-count-label";
    countLabel.textContent = "Break timer";

    const progress = document.createElement("div");
    progress.className = "bb-progress";
    const progressFill = document.createElement("div");
    progressFill.className = "bb-progress-fill";
    progress.appendChild(progressFill);

    right.appendChild(countdown);
    right.appendChild(countLabel);
    right.appendChild(progress);

    bottom.appendChild(left);
    bottom.appendChild(right);

    content.appendChild(spacer);
    content.appendChild(bottom);

    overlay.appendChild(videoStage);
    overlay.appendChild(dim);
    overlay.appendChild(grid);
    overlay.appendChild(watermark);
    overlay.appendChild(nav);
    overlay.appendChild(content);

    document.documentElement.appendChild(overlay);
    document.documentElement.style.overflow = "hidden";
    overlay.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
    overlay.addEventListener("keydown", (e) => e.stopPropagation());

    setupVideoScrub(video, overlay);

    requestAnimationFrame(() => {
      overlay.classList.add("bb-visible");
    });

    let secondsLeft = breakSeconds;
    updateCountdown(countMin, countSec, progressFill, secondsLeft, totalBreakSeconds);

    breakTimer = setInterval(() => {
      if (!extensionAlive()) {
        stopAll();
        return;
      }

      secondsLeft -= 1;
      const displaySeconds = Math.max(secondsLeft, 0);
      updateCountdown(countMin, countSec, progressFill, displaySeconds, totalBreakSeconds);
      if (secondsLeft <= 0) {
        clearInterval(breakTimer);
        breakTimer = null;
        endBreak(hostname, elapsedKey, breakEndKey);
      }
    }, 1000);
  }

  function endBreak(hostname, elapsedKey, breakEndKey) {
    storageSet({ [elapsedKey]: 0, [breakEndKey]: 0 }, () => {
      const overlay = document.getElementById("__break_buddy_overlay__");
      if (overlay) overlay.remove();
      document.documentElement.style.overflow = "";
      overlayActive = false;
      activeBreak = null;
      if (extensionAlive()) {
        startTracking(0, hostname, elapsedKey, breakEndKey);
      }
    });
  }

  function forceEndBreak() {
    if (breakTimer) {
      clearInterval(breakTimer);
      breakTimer = null;
    }

    if (activeBreak) {
      endBreak(activeBreak.hostname, activeBreak.elapsedKey, activeBreak.breakEndKey);
      return;
    }

    if (!settings) return;

    const hostname = getHostname();
    if (!hostMatches(hostname, settings.sites)) return;

    const elapsedKey = "elapsed_" + hostname;
    const breakEndKey = "breakEnd_" + hostname;

    storageSet({ [elapsedKey]: 0, [breakEndKey]: 0 }, () => {
      const overlay = document.getElementById("__break_buddy_overlay__");
      if (overlay) overlay.remove();
      document.documentElement.style.overflow = "";
      overlayActive = false;
      activeBreak = null;
      if (trackTimer) clearInterval(trackTimer);
      trackTimer = null;
      if (extensionAlive()) {
        startTracking(0, hostname, elapsedKey, breakEndKey);
      }
    });
  }

  if (extensionAlive()) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "local" || !changes.endAllBreaks) return;
      forceEndBreak();
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message?.action === "END_BREAK") {
        forceEndBreak();
      }
    });
  }

  init();
})();
