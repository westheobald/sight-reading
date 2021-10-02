/* eslint-disable import/extensions */
import * as view from './js/view.js';
import * as model from './js/model.js';

function generateMelody() {
  const melodyOptions = view.updateOptions();
  let previousNoteIndex;
  for (let stave = 0; stave < melodyOptions.staves; stave += 1) {
    for (let bar = 0; bar < melodyOptions.bars; bar += 1) {
      const melody = model.generateMelody(melodyOptions, previousNoteIndex);
      previousNoteIndex = view.createBar(melody, stave, bar);
    }
  }
}

function initStartingMelody() {
  view.erasePreviousMelody();
  generateMelody();
}

function init() {
  view.initGenerateBtn(generateMelody);
  view.initSettingsBtn();
  view.displayNoteRange('low', model.allNotes);
  view.displayNoteRange('high', model.allNotes);

  initStartingMelody();
}
init();
