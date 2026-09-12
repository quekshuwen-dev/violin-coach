# 🎻 Violin Star Coach

An installable web app (PWA) for young violin students: an accurate tuner,
a scale and arpeggio player using real violin recordings, a **Scale Check**
that listens while the child plays and says which notes were right, flat,
sharp or wrong, a practice calendar, and optional AI feedback on practice
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

## Practice tab: three ways to check a scale

The scale being checked is shown at the top (change it on the Scales tab).

- **Scale Check (live)**: press **Hear it** to listen to a real violin play
  it, then **Start** and play slowly, one clear note at a time. The next note
  pulses; every note turns green (in tune), amber (a little flat or sharp),
  red (wrong note) or grey (skipped) as it is heard.
- **Camera**: record the child playing the scale. When you stop, the audio is
  decoded and every note is checked the same way; a frame is kept for the
  AI's posture comment.
- **Upload**: choose a video of the scale (MP4, MOV, WebM); its audio is
  analysed the same way. **Choose Different Video** lets you upload another.

Every path ends with stars, a list of each note with its cents error, and
simple finger tips ("F♯4 was a little flat, slide that finger a tiny bit
towards the bridge"). The judgement is local and works offline.

**Stamps**: a scale analysed at **3, 4 or 5 stars** puts a 🎻 stamp on that
day of the calendar (several in one day show ×2, ×3…). A day that was tried
but did not reach 3 stars shows a small ★. The calendar counts days
practised this month, stamps, and the current streak.

With a Gemini key set, the measured per-note report (and the camera frame)
go to the AI teacher for a worded comment. It is told to use only the
measured facts and to name the notes. If the AI call fails, the reason is
shown in the card instead of a canned comment; the local result still counts.

How it judges: raw microphone → McLeod pitch detector → notes that hold a
steady pitch for 110 ms become note events → matched in order against the
scale (a wrong note followed by the right one counts as corrected; skipping
ahead marks the skipped note; an octave slip is called out). In tune is
within ±15 cents, "a little" flat/sharp up to ±35 cents. Stars: 5 all right
and ≥90 % in tune, 4–4.5 all right, 3 at least 75 % right, 2 at least half.
Logic lives in `js/notecheck.js` (matching) and `js/analyze.js` (recordings,
analysed at 32 kHz with 4096-sample windows every 40 ms) with tests in
`tests/`.

## Violin sound

Scale playback and the tuner's reference tones use real violin recordings
(`samples/violin`, 15 notes from G3 to C7) played through a small sampler
that shifts each recording to the exact pitch needed, so a 442 Hz or
pure-fifth reference is exact. Samples come from
[nbrosowsky/tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments)
(CC BY 3.0); each was measured with the app's own pitch detector and
resampled so its mean pitch is within 1 cent of the labelled note, then
trimmed to 3.5 s and encoded as 96 kbps MP3 (640 KB total, precached).

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
js/mic.js             shared raw-microphone pipeline
js/audio.js           violin sampler (exact pitch), reverb, Transport scheduling
js/playback.js        sequence player with count-in, clicks, bubble highlights
js/scales.js          scale explorer tab
js/scales-data.js     verified scale/arpeggio tables
js/notecheck.js       note tracking + scale matching + grading + comments
js/scalecheck.js      live Scale Check screen
js/analyze.js         decode a recording and check it offline
js/scaleresult.js     shared result rendering + stamp rule
js/practice.js        input modes, camera/upload, Gemini feedback
js/ui.js              profile bar, practice calendar, toast
samples/violin/       pitch-corrected violin recordings (CC BY 3.0)
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
- Tap a string to hear a real violin play exactly that target.

## AI feedback

The AI teacher comment uses the Gemini API with a key you paste into
Settings. The app lists the models available to that key and picks the
newest Flash model, so it keeps working as model names change. The key is
stored in this browser's local storage only and is sent only to Google's
API. Everything else works offline.

## Updates

`sw.js` precaches the whole app and serves the page and its scripts from
the same cached version, so they can never mismatch. A new deploy installs
in the background and takes over on the next launch; an **Update** toast
offers to reload sooner.
