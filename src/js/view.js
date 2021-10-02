import Vex from 'vexflow';

const VF = Vex.Flow;
let renderer;
let context;

export function createBar(obj, staveNumber, barNumber) {
  const { state } = obj;
  const { keys } = obj;
  const { rhythms } = obj;
  let stave;

  if (barNumber === 0) {
    stave = new VF.Stave(barNumber * 400, staveNumber * 200, 400)
      .addClef(state.clef)
      .addTimeSignature(state.timeSignature)
      .addKeySignature(state.key);
  } else {
    stave = new VF.Stave(barNumber * 400, staveNumber * 200, 400);
  }
  stave.setContext(context).draw();

  const notes = [];
  rhythms.forEach((rhythm, index) => {
    if (rhythm.includes('d')) {
      notes.push(new VF.StaveNote({ clef: state.clef, keys: [keys[index]], duration: rhythm })
        .addDot(0));
    } else {
      notes.push(new VF.StaveNote({ clef: state.clef, keys: [keys[index]], duration: rhythm }));
    }
  });

  const groupings = state.timeDenominator === 8 ? 3 : 2;
  const beams = VF.Beam.generateBeams(notes, {
    groups: [
      new Vex.Flow.Fraction(groupings, 8),
    ],
  });
  Vex.Flow.Formatter.FormatAndDraw(context, stave, notes);
  beams.forEach((b) => {
    b.setContext(context).draw();
  });

  return state.previousNoteIndex;
}

function getAvailableRhythms() {
  const selectedRhythms = document.querySelectorAll('.rhythm:checked');
  const availableRhythms = [];
  selectedRhythms.forEach((rhy) => availableRhythms.push(rhy.value));

  if (availableRhythms.includes('8d') && !availableRhythms.includes('16')) {
    availableRhythms.push('16');
    document.getElementById('sixteenth').checked = true;
    document.querySelector('.setting__error').classList.remove('hidden');
  } else document.querySelector('.setting__error').classList.add('hidden');

  return availableRhythms;
}

export function updateOptions() {
  const state = {};

  const barWidth = 400;
  const numOfBars = Math.floor((window.innerWidth) / barWidth);
  state.bars = (numOfBars > 0) ? numOfBars : 1;
  const staveHeight = 200;
  state.staves = Math.round((window.innerHeight - 50) / staveHeight);

  state.clef = document.getElementById('clef').value;
  state.key = document.getElementById('key').value;
  state.timeNumerator = +document.querySelector('.setting__numerator').value;
  state.timeDenominator = +document.querySelector('.setting__denominator').value;
  state.timeSignature = `${state.timeNumerator}/${state.timeDenominator}`;

  state.availableRhythms = getAvailableRhythms();
  state.allowRests = document.getElementById('rest').checked;
  state.restPercentage = +document.getElementById('restPercent').value;

  state.lowRange = +document.getElementById('lowRange').value;
  state.highRange = +document.getElementById('highRange').value;
  state.skipRange = +document.getElementById('skipRange').value - 1;
  state.repeatedNotePercentage = +document.getElementById('repeatedNotePercentage').value;

  const notationWidth = state.bars * 400;
  const allStaveHeight = state.staves * staveHeight;
  const totalHeight = window.innerHeight - 50;
  const notationHeight = (allStaveHeight > totalHeight) ? totalHeight : allStaveHeight;
  renderer.resize(notationWidth, notationHeight);

  return state;
}

export function erasePreviousMelody() {
  const notationWindow = document.getElementById('notation');
  notationWindow.innerHTML = '';
  renderer = new VF.Renderer(notationWindow, VF.Renderer.Backends.SVG);
  context = renderer.getContext();
}

function closeSettings() {
  const options = document.querySelector('.settings');
  if (options.classList.contains('hidden')) return;
  options.classList.add('hidden');
  const overlay = document.querySelector('.settings__overlay');
  overlay.classList.remove('settings__overlay--transitioned');
  const button = document.querySelector('.btn__settings');
  button.innerHTML = '<svg class="icon icon__settings"><use xlink:href="sprites.svg#icon__settings"></use></svg>';
}

function openSettings() {
  const options = document.querySelector('.settings');
  options.classList.remove('hidden');
  const overlay = document.querySelector('.settings__overlay');
  overlay.classList.add('settings__overlay--transitioned');
  const button = document.querySelector('.btn__settings');
  button.innerHTML = '<svg class="icon icon__close"><use xlink:href="sprites.svg#icon__close"></use></svg>';
}

function toggleSettings() {
  if (document.querySelector('.settings').classList.contains('hidden')) {
    openSettings();
  } else {
    closeSettings();
  }
}

export function initGenerateBtn(generateMelody) {
  document.querySelector('.btn__generate').addEventListener('click', () => {
    closeSettings();
    erasePreviousMelody();
    generateMelody();
  });
}

export function displayNoteRange(direction, allNotes) {
  document.getElementById(`${direction}Range`).addEventListener('input', (e) => {
    document.querySelector(`.range__text--${direction}`).innerHTML = allNotes[e.target.value].toUpperCase();
  });
}

export function initSettingsBtn() {
  document.getElementById('settingsBtn').addEventListener('click', () => toggleSettings());
}
