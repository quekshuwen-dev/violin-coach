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

## Scale Check (Practice tab)

1. Pick a scale on the Scales tab (level, type, key, tempo).
2. On the Practice tab press **Hear it** to listen to a real violin play it.
3. Press **Start** and play the scale slowly, one clear note at a time.
   The next note to play pulses; every note turns green (in tune), amber
   (a little flat or sharp), red (wrong note) or grey (skipped) as it is heard.
4. Press **Finished** (or the app finishes when the last note is played) to see
   stars, a list of every note with its cents error, and simple finger tips
   ("F♯4 was a little flat, slide that finger a tiny bit towards the bridge").

A scale with every note right earns a ✓ on that day of the calendar; the
calendar also counts days practised and the current streak. With a Gemini
key set, **Ask the AI teacher** sends the measured per-note report for a
warm, worded comment (it uses the measured facts only).

How it judges: raw microphone → McLeod pitch detector → notes that hold a
steady pitch for 110 ms become note events → matched in order against the
scale (a wrong note followed by the right one counts as corrected; skipping
ahead marks the skipped note; an octave slip is called out). In tune is
within ±15 cents, "a little" flat/sharp up to ±35 cents. Logic lives in
`js/notecheck.js` with tests in `tests/notecheck.test.js`.

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
js/scalecheck.js      Scale Check screen
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

Practice feedback uses the Gemini API with a key you paste into Settings.
The key is stored in this browser's local storage only and is sent only to
Google's API. Everything else works offline.
