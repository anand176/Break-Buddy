# Break Buddy

A tiny Chrome extension: after you spend too long on sites you choose, a
full-screen break video takes over the page until your break timer runs out.

## Load it in Chrome (no Web Store needed)

1. Unzip this folder somewhere permanent (don't delete it later — Chrome
   keeps loading the extension from this folder).
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right toggle).
4. Click **Load unpacked** and select the unzipped `break-buddy` folder.
5. The extension icon appears in your toolbar.

## Set it up

1. Click the toolbar icon to open settings.
2. Type the sites to limit, comma separated, using bare domains, e.g.
   `youtube.com, x.com, instagram.com`
3. Set **minutes before break** (how long you can browse before it
   triggers) and **break length** (how long the screen stays blocked).
4. Click **Save settings**.
5. Reload any tab that's already open on one of those sites — settings only
   apply to tabs loaded after you save.

There's nothing to upload — the break video is fixed and built into the
extension (`assets/hero.mp4`).

## How it behaves

- Time only counts while the tab is the active, focused one — switching
  tabs pauses the clock.
- When the limit is hit, a hero-style break screen fades in — same layout as
  the SynapseX landing hero: scrubbable background video, dot grid, REST
  watermark, top nav bar, and bottom typography with a large countdown timer.
- The extension tries to play the video with sound. Most browsers block
  audible autoplay unless you've already interacted with the page, so if
  sound doesn't start automatically, a small "Tap to unmute" link appears
  — click it once and it'll play with sound from then on for that page.
- The page underneath is locked (no scrolling or clicking) until the
  countdown finishes.
- After the break ends, the clock resets and counting starts again.
- While a break is running, open the extension popup and click **End break now**
  to dismiss the overlay immediately and unlock the tab.
- If you reload mid-break, the countdown picks up from where it left off
  instead of restarting.

## Known limitations

- One fixed video for every listed site — no per-site customization.
- Settings apply per browser profile, not synced across devices.
- A determined user can bypass it by disabling the extension in
  `chrome://extensions` — this is a friction tool, not a parental-control
  lock.
- To swap the video, replace `assets/hero.mp4` with another file of the
  same name and reload the extension.
