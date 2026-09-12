# 🎻 Violin Star Coach

An installable web app (PWA) for young violin students: an accurate tuner,
a scale and arpeggio player with metronome, and AI feedback on practice
videos. No build step, no framework: plain HTML, CSS and ES modules.

## Run it locally

PWAs need to be served over HTTP (not opened as a file). Any static server works:

```bash
npx serve -l 8080 .        # or: python3 -m http.server 8080
```

Then open <http://localhost:8080>. In Chrome or Edge an **Install** button
appears in the header; on iOS use Share → *Add to Home Screen*.

## Deploy

Copy the folder to any static host that serves HTTPS (GitHub Pages, Netlify,
Cloudflare Pages, Vercel). Paths are relative, so the app works from a
sub-path such as `https://user.github.io/violin-coach/`.

After you change any file listed in `sw.js`, bump `VERSION` there so
installed copies pick up the update. Users see an **Update** toast.

## Tests

```bash
npm test
```

Runs the scale-table validator (every scale checked against its interval
pattern and the violin's range), note-spelling tests, and pitch detector
accuracy tests on synthetic violin-like signals.

## Layout

```
index.html            markup only (handlers use data-action attributes)
css/app.css
js/app.js             boot, setup screen, profiles, settings, tabs, PWA wiring
js/actions.js         event delegation registry
js/state.js           localStorage state + helpers
js/notes.js           note spelling, MIDI/frequency maths, open-string targets
js/pitch.js           McLeod pitch detector (NSDF)
js/tuner.js           tuner tab
js/audio.js           Tone.js signal chain (synth, filter, vibrato, reverb)
js/scales.js          scale explorer tab and clock-accurate playback
js/scales-data.js     verified scale/arpeggio tables
js/practice.js        camera/upload, Gemini feedback, weekly stars
js/ui.js              profile bar, weekly tracker, toast
sw.js                 service worker: precache shell, offline fallback
manifest.webmanifest
vendor/Tone.js        Tone.js 14.8.49 (MIT), bundled for offline use
icons/                SVG source + generated PNGs
tests/                node --test suites
```

## Tuner notes

- Microphone is opened with echo cancellation, noise suppression and
  auto-gain **off**; those features distort harmonics and shift pitch.
- 8192-sample analysis window, 70 Hz high-pass, McLeod Pitch Method with
  parabolic interpolation: better than 0.5 cent on a steady open string.
- Reference pitch (A4) is adjustable in Settings (440 / 441 / 442 / 443 or any value).
- **Pure fifths** mode targets open strings tuned in perfect 3:2 fifths from
  A, the way violinists tune by ear (E +2¢, D −2¢, G −4¢ vs equal temperament).
- Tap a string to hear its reference tone.

## AI feedback

Practice feedback uses the Gemini API with a key you paste into Settings.
The key is stored in this browser's local storage only and is sent only to
Google's API. Everything else works offline.
