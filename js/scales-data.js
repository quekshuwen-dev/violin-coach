// Scale and arpeggio tables. Every entry is hand-written from the standard
// key signature and verified by tests/scales.test.js (interval pattern,
// descent mirrors ascent except melodic minor, violin range).
export const BEGINNER_SCALES = {
  'C': {asc:["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5","A5","B5","C6"],desc:["C6","B5","A5","G5","F5","E5","D5","C5","B4","A4","G4","F4","E4","D4","C4"]},
  'G': {asc:["G3","A3","B3","C4","D4","E4","F#4","G4","A4","B4","C5","D5","E5","F#5","G5"],desc:["G5","F#5","E5","D5","C5","B4","A4","G4","F#4","E4","D4","C4","B3","A3","G3"]},
  'D': {asc:["D4","E4","F#4","G4","A4","B4","C#5","D5","E5","F#5","G5","A5","B5","C#6","D6"],desc:["D6","C#6","B5","A5","G5","F#5","E5","D5","C#5","B4","A4","G4","F#4","E4","D4"]},
  'A': {asc:["A3","B3","C#4","D4","E4","F#4","G#4","A4","B4","C#5","D5","E5","F#5","G#5","A5"],desc:["A5","G#5","F#5","E5","D5","C#5","B4","A4","G#4","F#4","E4","D4","C#4","B3","A3"]},
  'F': {asc:["F4","G4","A4","Bb4","C5","D5","E5","F5","G5","A5","Bb5","C6","D6","E6","F6"],desc:["F6","E6","D6","C6","Bb5","A5","G5","F5","E5","D5","C5","Bb4","A4","G4","F4"]},
};

export const INTERMEDIATE_MAJOR = {
  'C': {asc:["C4","D4","E4","F4","G4","A4","B4","C5"],desc:["C5","B4","A4","G4","F4","E4","D4","C4"]},
  'G': {asc:["G3","A3","B3","C4","D4","E4","F#4","G4"],desc:["G4","F#4","E4","D4","C4","B3","A3","G3"]},
  'D': {asc:["D4","E4","F#4","G4","A4","B4","C#5","D5"],desc:["D5","C#5","B4","A4","G4","F#4","E4","D4"]},
  'A': {asc:["A3","B3","C#4","D4","E4","F#4","G#4","A4"],desc:["A4","G#4","F#4","E4","D4","C#4","B3","A3"]},
  'E': {asc:["E4","F#4","G#4","A4","B4","C#5","D#5","E5"],desc:["E5","D#5","C#5","B4","A4","G#4","F#4","E4"]},
  'B': {asc:["B3","C#4","D#4","E4","F#4","G#4","A#4","B4"],desc:["B4","A#4","G#4","F#4","E4","D#4","C#4","B3"]},
  'F#': {asc:["F#4","G#4","A#4","B4","C#5","D#5","E#5","F#5"],desc:["F#5","E#5","D#5","C#5","B4","A#4","G#4","F#4"]},
  'Db': {asc:["Db4","Eb4","F4","Gb4","Ab4","Bb4","C5","Db5"],desc:["Db5","C5","Bb4","Ab4","Gb4","F4","Eb4","Db4"]},
  'Ab': {asc:["Ab3","Bb3","C4","Db4","Eb4","F4","G4","Ab4"],desc:["Ab4","G4","F4","Eb4","Db4","C4","Bb3","Ab3"]},
  'Eb': {asc:["Eb4","F4","G4","Ab4","Bb4","C5","D5","Eb5"],desc:["Eb5","D5","C5","Bb4","Ab4","G4","F4","Eb4"]},
  'Bb': {asc:["Bb3","C4","D4","Eb4","F4","G4","A4","Bb4"],desc:["Bb4","A4","G4","F4","Eb4","D4","C4","Bb3"]},
  'F': {asc:["F4","G4","A4","Bb4","C5","D5","E5","F5"],desc:["F5","E5","D5","C5","Bb4","A4","G4","F4"]},
};

export const INTERMEDIATE_MINOR = {
  'A': {
    natural: {asc:["A3","B3","C4","D4","E4","F4","G4","A4"],desc:["A4","G4","F4","E4","D4","C4","B3","A3"]},
    harmonic: {asc:["A3","B3","C4","D4","E4","F4","G#4","A4"],desc:["A4","G#4","F4","E4","D4","C4","B3","A3"]},
    melodic: {asc:["A3","B3","C4","D4","E4","F#4","G#4","A4"],desc:["A4","G4","F4","E4","D4","C4","B3","A3"]},
  },
  'E': {
    natural: {asc:["E4","F#4","G4","A4","B4","C5","D5","E5"],desc:["E5","D5","C5","B4","A4","G4","F#4","E4"]},
    harmonic: {asc:["E4","F#4","G4","A4","B4","C5","D#5","E5"],desc:["E5","D#5","C5","B4","A4","G4","F#4","E4"]},
    melodic: {asc:["E4","F#4","G4","A4","B4","C#5","D#5","E5"],desc:["E5","D5","C5","B4","A4","G4","F#4","E4"]},
  },
  'B': {
    natural: {asc:["B3","C#4","D4","E4","F#4","G4","A4","B4"],desc:["B4","A4","G4","F#4","E4","D4","C#4","B3"]},
    harmonic: {asc:["B3","C#4","D4","E4","F#4","G4","A#4","B4"],desc:["B4","A#4","G4","F#4","E4","D4","C#4","B3"]},
    melodic: {asc:["B3","C#4","D4","E4","F#4","G#4","A#4","B4"],desc:["B4","A4","G4","F#4","E4","D4","C#4","B3"]},
  },
  'F#': {
    natural: {asc:["F#4","G#4","A4","B4","C#5","D5","E5","F#5"],desc:["F#5","E5","D5","C#5","B4","A4","G#4","F#4"]},
    harmonic: {asc:["F#4","G#4","A4","B4","C#5","D5","E#5","F#5"],desc:["F#5","E#5","D5","C#5","B4","A4","G#4","F#4"]},
    melodic: {asc:["F#4","G#4","A4","B4","C#5","D#5","E#5","F#5"],desc:["F#5","E5","D5","C#5","B4","A4","G#4","F#4"]},
  },
  'C#': {
    natural: {asc:["C#4","D#4","E4","F#4","G#4","A4","B4","C#5"],desc:["C#5","B4","A4","G#4","F#4","E4","D#4","C#4"]},
    harmonic: {asc:["C#4","D#4","E4","F#4","G#4","A4","B#4","C#5"],desc:["C#5","B#4","A4","G#4","F#4","E4","D#4","C#4"]},
    melodic: {asc:["C#4","D#4","E4","F#4","G#4","A#4","B#4","C#5"],desc:["C#5","B4","A4","G#4","F#4","E4","D#4","C#4"]},
  },
  'G#': {
    natural: {asc:["G#3","A#3","B3","C#4","D#4","E4","F#4","G#4"],desc:["G#4","F#4","E4","D#4","C#4","B3","A#3","G#3"]},
    harmonic: {asc:["G#3","A#3","B3","C#4","D#4","E4","Fx4","G#4"],desc:["G#4","Fx4","E4","D#4","C#4","B3","A#3","G#3"]},
    melodic: {asc:["G#3","A#3","B3","C#4","D#4","E#4","Fx4","G#4"],desc:["G#4","F#4","E4","D#4","C#4","B3","A#3","G#3"]},
  },
  'D': {
    natural: {asc:["D4","E4","F4","G4","A4","Bb4","C5","D5"],desc:["D5","C5","Bb4","A4","G4","F4","E4","D4"]},
    harmonic: {asc:["D4","E4","F4","G4","A4","Bb4","C#5","D5"],desc:["D5","C#5","Bb4","A4","G4","F4","E4","D4"]},
    melodic: {asc:["D4","E4","F4","G4","A4","B4","C#5","D5"],desc:["D5","C5","Bb4","A4","G4","F4","E4","D4"]},
  },
  'G': {
    natural: {asc:["G3","A3","Bb3","C4","D4","Eb4","F4","G4"],desc:["G4","F4","Eb4","D4","C4","Bb3","A3","G3"]},
    harmonic: {asc:["G3","A3","Bb3","C4","D4","Eb4","F#4","G4"],desc:["G4","F#4","Eb4","D4","C4","Bb3","A3","G3"]},
    melodic: {asc:["G3","A3","Bb3","C4","D4","E4","F#4","G4"],desc:["G4","F4","Eb4","D4","C4","Bb3","A3","G3"]},
  },
  'C': {
    natural: {asc:["C4","D4","Eb4","F4","G4","Ab4","Bb4","C5"],desc:["C5","Bb4","Ab4","G4","F4","Eb4","D4","C4"]},
    harmonic: {asc:["C4","D4","Eb4","F4","G4","Ab4","B4","C5"],desc:["C5","B4","Ab4","G4","F4","Eb4","D4","C4"]},
    melodic: {asc:["C4","D4","Eb4","F4","G4","A4","B4","C5"],desc:["C5","Bb4","Ab4","G4","F4","Eb4","D4","C4"]},
  },
  'F': {
    natural: {asc:["F4","G4","Ab4","Bb4","C5","Db5","Eb5","F5"],desc:["F5","Eb5","Db5","C5","Bb4","Ab4","G4","F4"]},
    harmonic: {asc:["F4","G4","Ab4","Bb4","C5","Db5","E5","F5"],desc:["F5","E5","Db5","C5","Bb4","Ab4","G4","F4"]},
    melodic: {asc:["F4","G4","Ab4","Bb4","C5","D5","E5","F5"],desc:["F5","Eb5","Db5","C5","Bb4","Ab4","G4","F4"]},
  },
  'Bb': {
    natural: {asc:["Bb3","C4","Db4","Eb4","F4","Gb4","Ab4","Bb4"],desc:["Bb4","Ab4","Gb4","F4","Eb4","Db4","C4","Bb3"]},
    harmonic: {asc:["Bb3","C4","Db4","Eb4","F4","Gb4","A4","Bb4"],desc:["Bb4","A4","Gb4","F4","Eb4","Db4","C4","Bb3"]},
    melodic: {asc:["Bb3","C4","Db4","Eb4","F4","G4","A4","Bb4"],desc:["Bb4","Ab4","Gb4","F4","Eb4","Db4","C4","Bb3"]},
  },
  'Eb': {
    natural: {asc:["Eb4","F4","Gb4","Ab4","Bb4","Cb5","Db5","Eb5"],desc:["Eb5","Db5","Cb5","Bb4","Ab4","Gb4","F4","Eb4"]},
    harmonic: {asc:["Eb4","F4","Gb4","Ab4","Bb4","Cb5","D5","Eb5"],desc:["Eb5","D5","Cb5","Bb4","Ab4","Gb4","F4","Eb4"]},
    melodic: {asc:["Eb4","F4","Gb4","Ab4","Bb4","C5","D5","Eb5"],desc:["Eb5","Db5","Cb5","Bb4","Ab4","Gb4","F4","Eb4"]},
  },
};

export const ADVANCED_MAJOR = {
  'C': {asc:["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5","A5","B5","C6","D6","E6","F6","G6","A6","B6","C7"],desc:["C7","B6","A6","G6","F6","E6","D6","C6","B5","A5","G5","F5","E5","D5","C5","B4","A4","G4","F4","E4","D4","C4"]},
  'G': {asc:["G3","A3","B3","C4","D4","E4","F#4","G4","A4","B4","C5","D5","E5","F#5","G5","A5","B5","C6","D6","E6","F#6","G6"],desc:["G6","F#6","E6","D6","C6","B5","A5","G5","F#5","E5","D5","C5","B4","A4","G4","F#4","E4","D4","C4","B3","A3","G3"]},
  'D': {asc:["D4","E4","F#4","G4","A4","B4","C#5","D5","E5","F#5","G5","A5","B5","C#6","D6","E6","F#6","G6","A6","B6","C#7","D7"],desc:["D7","C#7","B6","A6","G6","F#6","E6","D6","C#6","B5","A5","G5","F#5","E5","D5","C#5","B4","A4","G4","F#4","E4","D4"]},
  'A': {asc:["A3","B3","C#4","D4","E4","F#4","G#4","A4","B4","C#5","D5","E5","F#5","G#5","A5","B5","C#6","D6","E6","F#6","G#6","A6"],desc:["A6","G#6","F#6","E6","D6","C#6","B5","A5","G#5","F#5","E5","D5","C#5","B4","A4","G#4","F#4","E4","D4","C#4","B3","A3"]},
  'E': {asc:["E4","F#4","G#4","A4","B4","C#5","D#5","E5","F#5","G#5","A5","B5","C#6","D#6","E6","F#6","G#6","A6","B6","C#7","D#7","E7"],desc:["E7","D#7","C#7","B6","A6","G#6","F#6","E6","D#6","C#6","B5","A5","G#5","F#5","E5","D#5","C#5","B4","A4","G#4","F#4","E4"]},
  'B': {asc:["B3","C#4","D#4","E4","F#4","G#4","A#4","B4","C#5","D#5","E5","F#5","G#5","A#5","B5","C#6","D#6","E6","F#6","G#6","A#6","B6"],desc:["B6","A#6","G#6","F#6","E6","D#6","C#6","B5","A#5","G#5","F#5","E5","D#5","C#5","B4","A#4","G#4","F#4","E4","D#4","C#4","B3"]},
  'F#': {asc:["F#4","G#4","A#4","B4","C#5","D#5","E#5","F#5","G#5","A#5","B5","C#6","D#6","E#6","F#6","G#6","A#6","B6","C#7","D#7","E#7","F#7"],desc:["F#7","E#7","D#7","C#7","B6","A#6","G#6","F#6","E#6","D#6","C#6","B5","A#5","G#5","F#5","E#5","D#5","C#5","B4","A#4","G#4","F#4"]},
  'Db': {asc:["Db4","Eb4","F4","Gb4","Ab4","Bb4","C5","Db5","Eb5","F5","Gb5","Ab5","Bb5","C6","Db6","Eb6","F6","Gb6","Ab6","Bb6","C7","Db7"],desc:["Db7","C7","Bb6","Ab6","Gb6","F6","Eb6","Db6","C6","Bb5","Ab5","Gb5","F5","Eb5","Db5","C5","Bb4","Ab4","Gb4","F4","Eb4","Db4"]},
  'Ab': {asc:["Ab3","Bb3","C4","Db4","Eb4","F4","G4","Ab4","Bb4","C5","Db5","Eb5","F5","G5","Ab5","Bb5","C6","Db6","Eb6","F6","G6","Ab6"],desc:["Ab6","G6","F6","Eb6","Db6","C6","Bb5","Ab5","G5","F5","Eb5","Db5","C5","Bb4","Ab4","G4","F4","Eb4","Db4","C4","Bb3","Ab3"]},
  'Eb': {asc:["Eb4","F4","G4","Ab4","Bb4","C5","D5","Eb5","F5","G5","Ab5","Bb5","C6","D6","Eb6","F6","G6","Ab6","Bb6","C7","D7","Eb7"],desc:["Eb7","D7","C7","Bb6","Ab6","G6","F6","Eb6","D6","C6","Bb5","Ab5","G5","F5","Eb5","D5","C5","Bb4","Ab4","G4","F4","Eb4"]},
  'Bb': {asc:["Bb3","C4","D4","Eb4","F4","G4","A4","Bb4","C5","D5","Eb5","F5","G5","A5","Bb5","C6","D6","Eb6","F6","G6","A6","Bb6"],desc:["Bb6","A6","G6","F6","Eb6","D6","C6","Bb5","A5","G5","F5","Eb5","D5","C5","Bb4","A4","G4","F4","Eb4","D4","C4","Bb3"]},
  'F': {asc:["F4","G4","A4","Bb4","C5","D5","E5","F5","G5","A5","Bb5","C6","D6","E6","F6","G6","A6","Bb6","C7","D7","E7","F7"],desc:["F7","E7","D7","C7","Bb6","A6","G6","F6","E6","D6","C6","Bb5","A5","G5","F5","E5","D5","C5","Bb4","A4","G4","F4"]},
};

export const ADVANCED_NATURAL_MINOR = {
  'A': {asc:["A3","B3","C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5","A5","B5","C6","D6","E6","F6","G6","A6"],desc:["A6","G6","F6","E6","D6","C6","B5","A5","G5","F5","E5","D5","C5","B4","A4","G4","F4","E4","D4","C4","B3","A3"]},
  'E': {asc:["E4","F#4","G4","A4","B4","C5","D5","E5","F#5","G5","A5","B5","C6","D6","E6","F#6","G6","A6","B6","C7","D7","E7"],desc:["E7","D7","C7","B6","A6","G6","F#6","E6","D6","C6","B5","A5","G5","F#5","E5","D5","C5","B4","A4","G4","F#4","E4"]},
  'B': {asc:["B3","C#4","D4","E4","F#4","G4","A4","B4","C#5","D5","E5","F#5","G5","A5","B5","C#6","D6","E6","F#6","G6","A6","B6"],desc:["B6","A6","G6","F#6","E6","D6","C#6","B5","A5","G5","F#5","E5","D5","C#5","B4","A4","G4","F#4","E4","D4","C#4","B3"]},
  'F#': {asc:["F#4","G#4","A4","B4","C#5","D5","E5","F#5","G#5","A5","B5","C#6","D6","E6","F#6","G#6","A6","B6","C#7","D7","E7","F#7"],desc:["F#7","E7","D7","C#7","B6","A6","G#6","F#6","E6","D6","C#6","B5","A5","G#5","F#5","E5","D5","C#5","B4","A4","G#4","F#4"]},
  'C#': {asc:["C#4","D#4","E4","F#4","G#4","A4","B4","C#5","D#5","E5","F#5","G#5","A5","B5","C#6","D#6","E6","F#6","G#6","A6","B6","C#7"],desc:["C#7","B6","A6","G#6","F#6","E6","D#6","C#6","B5","A5","G#5","F#5","E5","D#5","C#5","B4","A4","G#4","F#4","E4","D#4","C#4"]},
  'G#': {asc:["G#3","A#3","B3","C#4","D#4","E4","F#4","G#4","A#4","B4","C#5","D#5","E5","F#5","G#5","A#5","B5","C#6","D#6","E6","F#6","G#6"],desc:["G#6","F#6","E6","D#6","C#6","B5","A#5","G#5","F#5","E5","D#5","C#5","B4","A#4","G#4","F#4","E4","D#4","C#4","B3","A#3","G#3"]},
  'D': {asc:["D4","E4","F4","G4","A4","Bb4","C5","D5","E5","F5","G5","A5","Bb5","C6","D6","E6","F6","G6","A6","Bb6","C7","D7"],desc:["D7","C7","Bb6","A6","G6","F6","E6","D6","C6","Bb5","A5","G5","F5","E5","D5","C5","Bb4","A4","G4","F4","E4","D4"]},
  'G': {asc:["G3","A3","Bb3","C4","D4","Eb4","F4","G4","A4","Bb4","C5","D5","Eb5","F5","G5","A5","Bb5","C6","D6","Eb6","F6","G6"],desc:["G6","F6","Eb6","D6","C6","Bb5","A5","G5","F5","Eb5","D5","C5","Bb4","A4","G4","F4","Eb4","D4","C4","Bb3","A3","G3"]},
  'C': {asc:["C4","D4","Eb4","F4","G4","Ab4","Bb4","C5","D5","Eb5","F5","G5","Ab5","Bb5","C6","D6","Eb6","F6","G6","Ab6","Bb6","C7"],desc:["C7","Bb6","Ab6","G6","F6","Eb6","D6","C6","Bb5","Ab5","G5","F5","Eb5","D5","C5","Bb4","Ab4","G4","F4","Eb4","D4","C4"]},
  'F': {asc:["F4","G4","Ab4","Bb4","C5","Db5","Eb5","F5","G5","Ab5","Bb5","C6","Db6","Eb6","F6","G6","Ab6","Bb6","C7","Db7","Eb7","F7"],desc:["F7","Eb7","Db7","C7","Bb6","Ab6","G6","F6","Eb6","Db6","C6","Bb5","Ab5","G5","F5","Eb5","Db5","C5","Bb4","Ab4","G4","F4"]},
  'Bb': {asc:["Bb3","C4","Db4","Eb4","F4","Gb4","Ab4","Bb4","C5","Db5","Eb5","F5","Gb5","Ab5","Bb5","C6","Db6","Eb6","F6","Gb6","Ab6","Bb6"],desc:["Bb6","Ab6","Gb6","F6","Eb6","Db6","C6","Bb5","Ab5","Gb5","F5","Eb5","Db5","C5","Bb4","Ab4","Gb4","F4","Eb4","Db4","C4","Bb3"]},
  'Eb': {asc:["Eb4","F4","Gb4","Ab4","Bb4","Cb5","Db5","Eb5","F5","Gb5","Ab5","Bb5","Cb6","Db6","Eb6","F6","Gb6","Ab6","Bb6","Cb7","Db7","Eb7"],desc:["Eb7","Db7","Cb7","Bb6","Ab6","Gb6","F6","Eb6","Db6","Cb6","Bb5","Ab5","Gb5","F5","Eb5","Db5","Cb5","Bb4","Ab4","Gb4","F4","Eb4"]},
};

export const ADVANCED_HARMONIC_MINOR = {
  'A': {asc:["A3","B3","C4","D4","E4","F4","G#4","A4","B4","C5","D5","E5","F5","G#5","A5","B5","C6","D6","E6","F6","G#6","A6"],desc:["A6","G#6","F6","E6","D6","C6","B5","A5","G#5","F5","E5","D5","C5","B4","A4","G#4","F4","E4","D4","C4","B3","A3"]},
  'E': {asc:["E4","F#4","G4","A4","B4","C5","D#5","E5","F#5","G5","A5","B5","C6","D#6","E6","F#6","G6","A6","B6","C7","D#7","E7"],desc:["E7","D#7","C7","B6","A6","G6","F#6","E6","D#6","C6","B5","A5","G5","F#5","E5","D#5","C5","B4","A4","G4","F#4","E4"]},
  'B': {asc:["B3","C#4","D4","E4","F#4","G4","A#4","B4","C#5","D5","E5","F#5","G5","A#5","B5","C#6","D6","E6","F#6","G6","A#6","B6"],desc:["B6","A#6","G6","F#6","E6","D6","C#6","B5","A#5","G5","F#5","E5","D5","C#5","B4","A#4","G4","F#4","E4","D4","C#4","B3"]},
  'F#': {asc:["F#4","G#4","A4","B4","C#5","D5","E#5","F#5","G#5","A5","B5","C#6","D6","E#6","F#6","G#6","A6","B6","C#7","D7","E#7","F#7"],desc:["F#7","E#7","D7","C#7","B6","A6","G#6","F#6","E#6","D6","C#6","B5","A5","G#5","F#5","E#5","D5","C#5","B4","A4","G#4","F#4"]},
  'C#': {asc:["C#4","D#4","E4","F#4","G#4","A4","B#4","C#5","D#5","E5","F#5","G#5","A5","B#5","C#6","D#6","E6","F#6","G#6","A6","B#6","C#7"],desc:["C#7","B#6","A6","G#6","F#6","E6","D#6","C#6","B#5","A5","G#5","F#5","E5","D#5","C#5","B#4","A4","G#4","F#4","E4","D#4","C#4"]},
  'G#': {asc:["G#3","A#3","B3","C#4","D#4","E4","Fx4","G#4","A#4","B4","C#5","D#5","E5","Fx5","G#5","A#5","B5","C#6","D#6","E6","Fx6","G#6"],desc:["G#6","Fx6","E6","D#6","C#6","B5","A#5","G#5","Fx5","E5","D#5","C#5","B4","A#4","G#4","Fx4","E4","D#4","C#4","B3","A#3","G#3"]},
  'D': {asc:["D4","E4","F4","G4","A4","Bb4","C#5","D5","E5","F5","G5","A5","Bb5","C#6","D6","E6","F6","G6","A6","Bb6","C#7","D7"],desc:["D7","C#7","Bb6","A6","G6","F6","E6","D6","C#6","Bb5","A5","G5","F5","E5","D5","C#5","Bb4","A4","G4","F4","E4","D4"]},
  'G': {asc:["G3","A3","Bb3","C4","D4","Eb4","F#4","G4","A4","Bb4","C5","D5","Eb5","F#5","G5","A5","Bb5","C6","D6","Eb6","F#6","G6"],desc:["G6","F#6","Eb6","D6","C6","Bb5","A5","G5","F#5","Eb5","D5","C5","Bb4","A4","G4","F#4","Eb4","D4","C4","Bb3","A3","G3"]},
  'C': {asc:["C4","D4","Eb4","F4","G4","Ab4","B4","C5","D5","Eb5","F5","G5","Ab5","B5","C6","D6","Eb6","F6","G6","Ab6","B6","C7"],desc:["C7","B6","Ab6","G6","F6","Eb6","D6","C6","B5","Ab5","G5","F5","Eb5","D5","C5","B4","Ab4","G4","F4","Eb4","D4","C4"]},
  'F': {asc:["F4","G4","Ab4","Bb4","C5","Db5","E5","F5","G5","Ab5","Bb5","C6","Db6","E6","F6","G6","Ab6","Bb6","C7","Db7","E7","F7"],desc:["F7","E7","Db7","C7","Bb6","Ab6","G6","F6","E6","Db6","C6","Bb5","Ab5","G5","F5","E5","Db5","C5","Bb4","Ab4","G4","F4"]},
  'Bb': {asc:["Bb3","C4","Db4","Eb4","F4","Gb4","A4","Bb4","C5","Db5","Eb5","F5","Gb5","A5","Bb5","C6","Db6","Eb6","F6","Gb6","A6","Bb6"],desc:["Bb6","A6","Gb6","F6","Eb6","Db6","C6","Bb5","A5","Gb5","F5","Eb5","Db5","C5","Bb4","A4","Gb4","F4","Eb4","Db4","C4","Bb3"]},
  'Eb': {asc:["Eb4","F4","Gb4","Ab4","Bb4","Cb5","D5","Eb5","F5","Gb5","Ab5","Bb5","Cb6","D6","Eb6","F6","Gb6","Ab6","Bb6","Cb7","D7","Eb7"],desc:["Eb7","D7","Cb7","Bb6","Ab6","Gb6","F6","Eb6","D6","Cb6","Bb5","Ab5","Gb5","F5","Eb5","D5","Cb5","Bb4","Ab4","Gb4","F4","Eb4"]},
};

export const ADVANCED_MELODIC_MINOR = {
  'A': {asc:["A3","B3","C4","D4","E4","F#4","G#4","A4","B4","C5","D5","E5","F#5","G#5","A5","B5","C6","D6","E6","F#6","G#6","A6"],desc:["A6","G6","F6","E6","D6","C6","B5","A5","G5","F5","E5","D5","C5","B4","A4","G4","F4","E4","D4","C4","B3","A3"]},
  'E': {asc:["E4","F#4","G4","A4","B4","C#5","D#5","E5","F#5","G5","A5","B5","C#6","D#6","E6","F#6","G6","A6","B6","C#7","D#7","E7"],desc:["E7","D7","C7","B6","A6","G6","F#6","E6","D6","C6","B5","A5","G5","F#5","E5","D5","C5","B4","A4","G4","F#4","E4"]},
  'B': {asc:["B3","C#4","D4","E4","F#4","G#4","A#4","B4","C#5","D5","E5","F#5","G#5","A#5","B5","C#6","D6","E6","F#6","G#6","A#6","B6"],desc:["B6","A6","G6","F#6","E6","D6","C#6","B5","A5","G5","F#5","E5","D5","C#5","B4","A4","G4","F#4","E4","D4","C#4","B3"]},
  'F#': {asc:["F#4","G#4","A4","B4","C#5","D#5","E#5","F#5","G#5","A5","B5","C#6","D#6","E#6","F#6","G#6","A6","B6","C#7","D#7","E#7","F#7"],desc:["F#7","E7","D7","C#7","B6","A6","G#6","F#6","E6","D6","C#6","B5","A5","G#5","F#5","E5","D5","C#5","B4","A4","G#4","F#4"]},
  'C#': {asc:["C#4","D#4","E4","F#4","G#4","A#4","B#4","C#5","D#5","E5","F#5","G#5","A#5","B#5","C#6","D#6","E6","F#6","G#6","A#6","B#6","C#7"],desc:["C#7","B6","A6","G#6","F#6","E6","D#6","C#6","B5","A5","G#5","F#5","E5","D#5","C#5","B4","A4","G#4","F#4","E4","D#4","C#4"]},
  'G#': {asc:["G#3","A#3","B3","C#4","D#4","E#4","Fx4","G#4","A#4","B4","C#5","D#5","E#5","Fx5","G#5","A#5","B5","C#6","D#6","E#6","Fx6","G#6"],desc:["G#6","F#6","E6","D#6","C#6","B5","A#5","G#5","F#5","E5","D#5","C#5","B4","A#4","G#4","F#4","E4","D#4","C#4","B3","A#3","G#3"]},
  'D': {asc:["D4","E4","F4","G4","A4","B4","C#5","D5","E5","F5","G5","A5","B5","C#6","D6","E6","F6","G6","A6","B6","C#7","D7"],desc:["D7","C7","Bb6","A6","G6","F6","E6","D6","C6","Bb5","A5","G5","F5","E5","D5","C5","Bb4","A4","G4","F4","E4","D4"]},
  'G': {asc:["G3","A3","Bb3","C4","D4","E4","F#4","G4","A4","Bb4","C5","D5","E5","F#5","G5","A5","Bb5","C6","D6","E6","F#6","G6"],desc:["G6","F6","Eb6","D6","C6","Bb5","A5","G5","F5","Eb5","D5","C5","Bb4","A4","G4","F4","Eb4","D4","C4","Bb3","A3","G3"]},
  'C': {asc:["C4","D4","Eb4","F4","G4","A4","B4","C5","D5","Eb5","F5","G5","A5","B5","C6","D6","Eb6","F6","G6","A6","B6","C7"],desc:["C7","Bb6","Ab6","G6","F6","Eb6","D6","C6","Bb5","Ab5","G5","F5","Eb5","D5","C5","Bb4","Ab4","G4","F4","Eb4","D4","C4"]},
  'F': {asc:["F4","G4","Ab4","Bb4","C5","D5","E5","F5","G5","Ab5","Bb5","C6","D6","E6","F6","G6","Ab6","Bb6","C7","D7","E7","F7"],desc:["F7","Eb7","Db7","C7","Bb6","Ab6","G6","F6","Eb6","Db6","C6","Bb5","Ab5","G5","F5","Eb5","Db5","C5","Bb4","Ab4","G4","F4"]},
  'Bb': {asc:["Bb3","C4","Db4","Eb4","F4","G4","A4","Bb4","C5","Db5","Eb5","F5","G5","A5","Bb5","C6","Db6","Eb6","F6","G6","A6","Bb6"],desc:["Bb6","Ab6","Gb6","F6","Eb6","Db6","C6","Bb5","Ab5","Gb5","F5","Eb5","Db5","C5","Bb4","Ab4","Gb4","F4","Eb4","Db4","C4","Bb3"]},
  'Eb': {asc:["Eb4","F4","Gb4","Ab4","Bb4","C5","D5","Eb5","F5","Gb5","Ab5","Bb5","C6","D6","Eb6","F6","Gb6","Ab6","Bb6","C7","D7","Eb7"],desc:["Eb7","Db7","Cb7","Bb6","Ab6","Gb6","F6","Eb6","Db6","Cb6","Bb5","Ab5","Gb5","F5","Eb5","Db5","Cb5","Bb4","Ab4","Gb4","F4","Eb4"]},
};

export const CHROMATIC_3OCT = {asc:["G3","G#3","A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4","A4","A#4","B4","C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5","A5","A#5","B5","C6","C#6","D6","D#6","E6","F6","F#6","G6"],desc:["G6","Gb6","F6","E6","Eb6","D6","Db6","C6","B5","Bb5","A5","Ab5","G5","Gb5","F5","E5","Eb5","D5","Db5","C5","B4","Bb4","A4","Ab4","G4","Gb4","F4","E4","Eb4","D4","Db4","C4","B3","Bb3","A3","Ab3","G3"]};

export const MAJOR_ARPEGGIO = {
  'C': {asc:["C4","E4","G4","C5","E5","G5","C6","E6","G6","C7"],desc:["C7","G6","E6","C6","G5","E5","C5","G4","E4","C4"]},
  'G': {asc:["G3","B3","D4","G4","B4","D5","G5","B5","D6","G6"],desc:["G6","D6","B5","G5","D5","B4","G4","D4","B3","G3"]},
  'D': {asc:["D4","F#4","A4","D5","F#5","A5","D6","F#6","A6","D7"],desc:["D7","A6","F#6","D6","A5","F#5","D5","A4","F#4","D4"]},
  'A': {asc:["A3","C#4","E4","A4","C#5","E5","A5","C#6","E6","A6"],desc:["A6","E6","C#6","A5","E5","C#5","A4","E4","C#4","A3"]},
  'E': {asc:["E4","G#4","B4","E5","G#5","B5","E6","G#6","B6","E7"],desc:["E7","B6","G#6","E6","B5","G#5","E5","B4","G#4","E4"]},
  'B': {asc:["B3","D#4","F#4","B4","D#5","F#5","B5","D#6","F#6","B6"],desc:["B6","F#6","D#6","B5","F#5","D#5","B4","F#4","D#4","B3"]},
  'F#': {asc:["F#4","A#4","C#5","F#5","A#5","C#6","F#6","A#6","C#7","F#7"],desc:["F#7","C#7","A#6","F#6","C#6","A#5","F#5","C#5","A#4","F#4"]},
  'Db': {asc:["Db4","F4","Ab4","Db5","F5","Ab5","Db6","F6","Ab6","Db7"],desc:["Db7","Ab6","F6","Db6","Ab5","F5","Db5","Ab4","F4","Db4"]},
  'Ab': {asc:["Ab3","C4","Eb4","Ab4","C5","Eb5","Ab5","C6","Eb6","Ab6"],desc:["Ab6","Eb6","C6","Ab5","Eb5","C5","Ab4","Eb4","C4","Ab3"]},
  'Eb': {asc:["Eb4","G4","Bb4","Eb5","G5","Bb5","Eb6","G6","Bb6","Eb7"],desc:["Eb7","Bb6","G6","Eb6","Bb5","G5","Eb5","Bb4","G4","Eb4"]},
  'Bb': {asc:["Bb3","D4","F4","Bb4","D5","F5","Bb5","D6","F6","Bb6"],desc:["Bb6","F6","D6","Bb5","F5","D5","Bb4","F4","D4","Bb3"]},
  'F': {asc:["F4","A4","C5","F5","A5","C6","F6","A6","C7","F7"],desc:["F7","C7","A6","F6","C6","A5","F5","C5","A4","F4"]},
};

export const MINOR_ARPEGGIO = {
  'A': {asc:["A3","C4","E4","A4","C5","E5","A5","C6","E6","A6"],desc:["A6","E6","C6","A5","E5","C5","A4","E4","C4","A3"]},
  'E': {asc:["E4","G4","B4","E5","G5","B5","E6","G6","B6","E7"],desc:["E7","B6","G6","E6","B5","G5","E5","B4","G4","E4"]},
  'B': {asc:["B3","D4","F#4","B4","D5","F#5","B5","D6","F#6","B6"],desc:["B6","F#6","D6","B5","F#5","D5","B4","F#4","D4","B3"]},
  'F#': {asc:["F#4","A4","C#5","F#5","A5","C#6","F#6","A6","C#7","F#7"],desc:["F#7","C#7","A6","F#6","C#6","A5","F#5","C#5","A4","F#4"]},
  'C#': {asc:["C#4","E4","G#4","C#5","E5","G#5","C#6","E6","G#6","C#7"],desc:["C#7","G#6","E6","C#6","G#5","E5","C#5","G#4","E4","C#4"]},
  'G#': {asc:["G#3","B3","D#4","G#4","B4","D#5","G#5","B5","D#6","G#6"],desc:["G#6","D#6","B5","G#5","D#5","B4","G#4","D#4","B3","G#3"]},
  'D': {asc:["D4","F4","A4","D5","F5","A5","D6","F6","A6","D7"],desc:["D7","A6","F6","D6","A5","F5","D5","A4","F4","D4"]},
  'G': {asc:["G3","Bb3","D4","G4","Bb4","D5","G5","Bb5","D6","G6"],desc:["G6","D6","Bb5","G5","D5","Bb4","G4","D4","Bb3","G3"]},
  'C': {asc:["C4","Eb4","G4","C5","Eb5","G5","C6","Eb6","G6","C7"],desc:["C7","G6","Eb6","C6","G5","Eb5","C5","G4","Eb4","C4"]},
  'F': {asc:["F4","Ab4","C5","F5","Ab5","C6","F6","Ab6","C7","F7"],desc:["F7","C7","Ab6","F6","C6","Ab5","F5","C5","Ab4","F4"]},
  'Bb': {asc:["Bb3","Db4","F4","Bb4","Db5","F5","Bb5","Db6","F6","Bb6"],desc:["Bb6","F6","Db6","Bb5","F5","Db5","Bb4","F4","Db4","Bb3"]},
  'Eb': {asc:["Eb4","Gb4","Bb4","Eb5","Gb5","Bb5","Eb6","Gb6","Bb6","Eb7"],desc:["Eb7","Bb6","Gb6","Eb6","Bb5","Gb5","Eb5","Bb4","Gb4","Eb4"]},
};

export const DOM7_ARPEGGIO = {
  'C': {asc:["C4","E4","G4","Bb4","C5","E5","G5","Bb5","C6","E6","G6","Bb6","C7"],desc:["C7","Bb6","G6","E6","C6","Bb5","G5","E5","C5","Bb4","G4","E4","C4"]},
  'G': {asc:["G3","B3","D4","F4","G4","B4","D5","F5","G5","B5","D6","F6","G6"],desc:["G6","F6","D6","B5","G5","F5","D5","B4","G4","F4","D4","B3","G3"]},
  'D': {asc:["D4","F#4","A4","C5","D5","F#5","A5","C6","D6","F#6","A6","C7","D7"],desc:["D7","C7","A6","F#6","D6","C6","A5","F#5","D5","C5","A4","F#4","D4"]},
  'A': {asc:["A3","C#4","E4","G4","A4","C#5","E5","G5","A5","C#6","E6","G6","A6"],desc:["A6","G6","E6","C#6","A5","G5","E5","C#5","A4","G4","E4","C#4","A3"]},
  'E': {asc:["E4","G#4","B4","D5","E5","G#5","B5","D6","E6","G#6","B6","D7","E7"],desc:["E7","D7","B6","G#6","E6","D6","B5","G#5","E5","D5","B4","G#4","E4"]},
  'B': {asc:["B3","D#4","F#4","A4","B4","D#5","F#5","A5","B5","D#6","F#6","A6","B6"],desc:["B6","A6","F#6","D#6","B5","A5","F#5","D#5","B4","A4","F#4","D#4","B3"]},
  'F#': {asc:["F#4","A#4","C#5","E5","F#5","A#5","C#6","E6","F#6","A#6","C#7","E7","F#7"],desc:["F#7","E7","C#7","A#6","F#6","E6","C#6","A#5","F#5","E5","C#5","A#4","F#4"]},
  'Db': {asc:["Db4","F4","Ab4","Cb5","Db5","F5","Ab5","Cb6","Db6","F6","Ab6","Cb7","Db7"],desc:["Db7","Cb7","Ab6","F6","Db6","Cb6","Ab5","F5","Db5","Cb5","Ab4","F4","Db4"]},
  'Ab': {asc:["Ab3","C4","Eb4","Gb4","Ab4","C5","Eb5","Gb5","Ab5","C6","Eb6","Gb6","Ab6"],desc:["Ab6","Gb6","Eb6","C6","Ab5","Gb5","Eb5","C5","Ab4","Gb4","Eb4","C4","Ab3"]},
  'Eb': {asc:["Eb4","G4","Bb4","Db5","Eb5","G5","Bb5","Db6","Eb6","G6","Bb6","Db7","Eb7"],desc:["Eb7","Db7","Bb6","G6","Eb6","Db6","Bb5","G5","Eb5","Db5","Bb4","G4","Eb4"]},
  'Bb': {asc:["Bb3","D4","F4","Ab4","Bb4","D5","F5","Ab5","Bb5","D6","F6","Ab6","Bb6"],desc:["Bb6","Ab6","F6","D6","Bb5","Ab5","F5","D5","Bb4","Ab4","F4","D4","Bb3"]},
  'F': {asc:["F4","A4","C5","Eb5","F5","A5","C6","Eb6","F6","A6","C7","Eb7","F7"],desc:["F7","Eb7","C7","A6","F6","Eb6","C6","A5","F5","Eb5","C5","A4","F4"]},
};

export const DIM7_ARPEGGIO = {
  'A': {asc:["A3","C4","Eb4","Gb4","A4","C5","Eb5","Gb5","A5","C6","Eb6","Gb6","A6"],desc:["A6","Gb6","Eb6","C6","A5","Gb5","Eb5","C5","A4","Gb4","Eb4","C4","A3"]},
  'E': {asc:["E4","G4","Bb4","Db5","E5","G5","Bb5","Db6","E6","G6","Bb6","Db7","E7"],desc:["E7","Db7","Bb6","G6","E6","Db6","Bb5","G5","E5","Db5","Bb4","G4","E4"]},
  'B': {asc:["B3","D4","F4","Ab4","B4","D5","F5","Ab5","B5","D6","F6","Ab6","B6"],desc:["B6","Ab6","F6","D6","B5","Ab5","F5","D5","B4","Ab4","F4","D4","B3"]},
  'F#': {asc:["F#4","A4","C5","Eb5","F#5","A5","C6","Eb6","F#6","A6","C7","Eb7","F#7"],desc:["F#7","Eb7","C7","A6","F#6","Eb6","C6","A5","F#5","Eb5","C5","A4","F#4"]},
  'C#': {asc:["C#4","E4","G4","Bb4","C#5","E5","G5","Bb5","C#6","E6","G6","Bb6","C#7"],desc:["C#7","Bb6","G6","E6","C#6","Bb5","G5","E5","C#5","Bb4","G4","E4","C#4"]},
  'G#': {asc:["G#3","B3","D4","F4","G#4","B4","D5","F5","G#5","B5","D6","F6","G#6"],desc:["G#6","F6","D6","B5","G#5","F5","D5","B4","G#4","F4","D4","B3","G#3"]},
  'D': {asc:["D4","F4","Ab4","Cb5","D5","F5","Ab5","Cb6","D6","F6","Ab6","Cb7","D7"],desc:["D7","Cb7","Ab6","F6","D6","Cb6","Ab5","F5","D5","Cb5","Ab4","F4","D4"]},
  'G': {asc:["G3","Bb3","Db4","Fb4","G4","Bb4","Db5","Fb5","G5","Bb5","Db6","Fb6","G6"],desc:["G6","Fb6","Db6","Bb5","G5","Fb5","Db5","Bb4","G4","Fb4","Db4","Bb3","G3"]},
  'C': {asc:["C4","Eb4","Gb4","Bbb4","C5","Eb5","Gb5","Bbb5","C6","Eb6","Gb6","Bbb6","C7"],desc:["C7","Bbb6","Gb6","Eb6","C6","Bbb5","Gb5","Eb5","C5","Bbb4","Gb4","Eb4","C4"]},
  'F': {asc:["F4","Ab4","Cb5","Ebb5","F5","Ab5","Cb6","Ebb6","F6","Ab6","Cb7","Ebb7","F7"],desc:["F7","Ebb7","Cb7","Ab6","F6","Ebb6","Cb6","Ab5","F5","Ebb5","Cb5","Ab4","F4"]},
  'Bb': {asc:["Bb3","Db4","Fb4","Abb4","Bb4","Db5","Fb5","Abb5","Bb5","Db6","Fb6","Abb6","Bb6"],desc:["Bb6","Abb6","Fb6","Db6","Bb5","Abb5","Fb5","Db5","Bb4","Abb4","Fb4","Db4","Bb3"]},
  'Eb': {asc:["Eb4","Gb4","Bbb4","Dbb5","Eb5","Gb5","Bbb5","Dbb6","Eb6","Gb6","Bbb6","Dbb7","Eb7"],desc:["Eb7","Dbb7","Bbb6","Gb6","Eb6","Dbb6","Bbb5","Gb5","Eb5","Dbb5","Bbb4","Gb4","Eb4"]},
};

export const BPM_OPTIONS=[40,50,60,70,80,90,100,120];
// Rainbow colours for note bubbles (7 scale degrees)
export const NB_COLS=[
  {bg:"#FEE2E2",c:"#991B1B"},{bg:"#FEF3C7",c:"#92400E"},{bg:"#D1FAE5",c:"#064E3B"},
  {bg:"#CFFAFE",c:"#164E63"},{bg:"#DBEAFE",c:"#1E3A5F"},{bg:"#EDE9FE",c:"#4C1D95"},
  {bg:"#FCE7F3",c:"#831843"}
];
export const LEVEL_TYPES={
  beginner:[{id:"major",label:"☀️ Major"}],
  intermediate:[
    {id:"major",label:"☀️ Major"},{id:"natural",label:"🌙 Nat. Minor"},
    {id:"harmonic",label:"🌗 Harm. Minor"},{id:"melodic",label:"🌘 Mel. Minor"}
  ],
  advanced:[
    {id:"major",label:"☀️ Major"},{id:"natural",label:"🌙 Nat. Minor"},
    {id:"harmonic",label:"🌗 Harm. Minor"},{id:"melodic",label:"🌘 Mel. Minor"},
    {id:"chromatic",label:"🌈 Chromatic"},{id:"majArp",label:"🎯 Maj. Arpeggio"},
    {id:"minArp",label:"🎯 Min. Arpeggio"},{id:"dom7Arp",label:"🎪 Dom7 Arpeggio"},
    {id:"dim7Arp",label:"🎪 Dim7 Arpeggio"}
  ]
};
export const LEVEL_DESC={
  beginner:"5 essential major keys — great for starting out!",
  intermediate:"All 12 major keys, and every minor key in 3 forms (1 octave)",
  advanced:"Full 3-octave scales, chromatic scale, and 4 arpeggio types"
};
export const TYPE_LABELS={major:"Major ☀️",natural:"Natural Minor 🌙",harmonic:"Harmonic Minor 🌗",melodic:"Melodic Minor 🌘",
  chromatic:"Chromatic Scale 🌈",majArp:"Major Arpeggio 🎯",minArp:"Minor Arpeggio 🎯",
  dom7Arp:"Dominant 7th Arpeggio 🎪",dim7Arp:"Diminished 7th Arpeggio 🎪"};

export function isMinorType(t){return t==="natural"||t==="harmonic"||t==="melodic";}
export function isChromaticOrArp(t){return t==="chromatic"||t==="majArp"||t==="minArp"||t==="dom7Arp"||t==="dim7Arp";}

const ADV={major:ADVANCED_MAJOR,natural:ADVANCED_NATURAL_MINOR,harmonic:ADVANCED_HARMONIC_MINOR,melodic:ADVANCED_MELODIC_MINOR,
  majArp:MAJOR_ARPEGGIO,minArp:MINOR_ARPEGGIO,dom7Arp:DOM7_ARPEGGIO,dim7Arp:DIM7_ARPEGGIO};

// Keys available for a level + type
export function getAvailableKeys(level,type){
  if(level==="beginner")return Object.keys(BEGINNER_SCALES);
  if(level==="intermediate")return Object.keys(type==="major"?INTERMEDIATE_MAJOR:INTERMEDIATE_MINOR);
  if(type==="chromatic")return [];
  return Object.keys(ADV[type]||ADVANCED_MAJOR);
}
// {asc,desc} note lists for a level/type/key
export function getScaleData(level,type,key){
  if(level==="beginner")return BEGINNER_SCALES[key]||BEGINNER_SCALES.C;
  if(level==="intermediate"){
    if(type==="major")return INTERMEDIATE_MAJOR[key]||INTERMEDIATE_MAJOR.C;
    const forms=INTERMEDIATE_MINOR[key]||INTERMEDIATE_MINOR.A;
    return forms[type]||forms.natural;
  }
  if(type==="chromatic")return CHROMATIC_3OCT;
  const t=ADV[type]||ADVANCED_MAJOR;
  return t[key]||t[Object.keys(t)[0]];
}
