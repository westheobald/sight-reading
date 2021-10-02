/* eslint-disable import/extensions */
import * as helpers from './helpers.js';

let state = {};

export const allNotes = [
  'a/0', 'b/0',
  'c/1', 'd/1', 'e/1', 'f/1', 'g/1', 'a/1', 'b/1',
  'c/2', 'd/2', 'e/2', 'f/2', 'g/2', 'a/2', 'b/2',
  'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3',
  'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4',
  'c/5', 'd/5', 'e/5', 'f/5', 'g/5', 'a/5', 'b/5',
  'c/6', 'd/6', 'e/6', 'f/6', 'g/6', 'a/6', 'b/6',
  'c/7', 'd/7', 'e/7', 'f/7', 'g/7', 'a/7', 'b/7',
  'c/8',
];

function setupState(obj) {
  state = obj;
  const timeSignatureValues = {
    2: 0.5,
    4: 0.25,
    8: 0.125,
    16: 0.0625,
  };
  state.oneBeatLength = timeSignatureValues[state.timeDenominator];
  state.oneMeasureLength = timeSignatureValues[state.timeDenominator] * state.timeNumerator;
  state.noteRange = allNotes.slice(state.lowRange, state.highRange + 1);
}

function addRests(rhythm) {
  const randomNum = helpers.getRandomNumber(0, 100);
  if (randomNum < state.restPercentage) {
    return `${rhythm}r`;
  }
  return rhythm;
}

function generateBeat(length) {
  let beatLength = length;
  const availableRhythms = state.availableRhythms.slice();
  const rhythms = [];
  const allRhythms = {
    h: 0.5,
    qd: 0.375,
    q: 0.25,
    '8d': 0.1875,
    8: 0.125,
    16: 0.0625,
  };

  while (beatLength > 0) {
    // removes rhythms larger than the number of beats remaining in the bar
    if (beatLength < 1 && availableRhythms.indexOf('w') !== -1) availableRhythms.splice(availableRhythms.indexOf('w'), 1);
    if (beatLength < 0.75 && availableRhythms.indexOf('hd') !== -1) availableRhythms.splice(availableRhythms.indexOf('hd'), 1);
    if (beatLength < 0.5 && availableRhythms.indexOf('h') !== -1) availableRhythms.splice(availableRhythms.indexOf('h'), 1);
    if (beatLength < 0.375 && availableRhythms.indexOf('qd') !== -1) availableRhythms.splice(availableRhythms.indexOf('qd'), 1);
    if (beatLength < 0.25 && availableRhythms.indexOf('q') !== -1) availableRhythms.splice(availableRhythms.indexOf('q'), 1);
    if (beatLength < 0.1875 && availableRhythms.indexOf('8d') !== -1) availableRhythms.splice(availableRhythms.indexOf('8d'), 1);
    if (beatLength < 0.125 && availableRhythms.indexOf('8') !== -1) availableRhythms.splice(availableRhythms.indexOf('8'), 1);
    const rhythm = availableRhythms[helpers.getRandomIndex(availableRhythms)];
    if (state.allowRests) {
      rhythms.push(addRests(rhythm));
    } else {
      rhythms.push(rhythm);
    }
    beatLength -= allRhythms[rhythm];
  }
  return rhythms;
}

function generateRhythmOneMeasure() {
  const rhythmList = [];
  let { oneMeasureLength } = state;

  while (oneMeasureLength > 0) {
    const rhythms = generateBeat(state.oneBeatLength);
    rhythms.forEach((rhythm) => {
      rhythmList.push(rhythm);
    });
    oneMeasureLength -= state.oneBeatLength;
  }
  return rhythmList;
}

function getNextNoteIndex() {
  if (helpers.getRandomPercentage() < state.repeatedNotePercentage) {
    return state.previousNoteIndex;
  }

  const noteChange = helpers.getRandomNumber(1, state.skipRange);
  const { previousNoteIndex } = state;
  // if random gen is true, new note is higher than previous (unless above noteRange)
  if (helpers.getRandomBoolean()) {
    if (previousNoteIndex + noteChange >= state.noteRange.length) {
      return previousNoteIndex - noteChange;
    }
    return previousNoteIndex + noteChange;
  }
  // else new note is lower than previous (unless it goes below 0)
  if (previousNoteIndex - noteChange < 0) { return previousNoteIndex + noteChange; }
  return previousNoteIndex - noteChange;
}

function centerRests() {
  if (state.clef === 'treble') { return 'b/4'; }
  if (state.clef === 'bass') { return 'd/3'; }
  if (state.clef === 'tenor') { return 'a/3'; }
  // alto
  return 'c/4';
}

function generateKeys(rhythms) {
  const notes = [];

  for (let i = 0; i < rhythms.length; i += 1) {
    if (rhythms[i].includes('r')) {
      notes.push(centerRests());
    } else if (!state.previousNoteIndex && state.previousNoteIndex !== 0) {
      const noteIndex = helpers.getRandomIndex(state.noteRange);
      notes.push(state.noteRange[noteIndex]);
      state.previousNoteIndex = noteIndex;
    } else {
      const noteIndex = getNextNoteIndex();
      notes.push(state.noteRange[noteIndex]);
      state.previousNoteIndex = noteIndex;
    }
  }
  return notes;
}

export function generateMelody(viewOptions, previousNoteIndex) {
  setupState(viewOptions);
  if (previousNoteIndex) {
    state.previousNoteIndex = previousNoteIndex;
  }
  const rhythms = generateRhythmOneMeasure();
  const keys = generateKeys(rhythms);
  return { state, rhythms, keys };
}
