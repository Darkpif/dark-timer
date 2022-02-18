const { ipcRenderer } = require('electron');

let timerVisualisation;
let setTimer;
let timerValue;
let soundFile;
let textFile;
let timeout;
let endText;
let started = false;
let paused = false;

function timerShow() {
  const min = Math.floor(timerValue / 60);
  const sec = timerValue - (min * 60);
  let minText = min;
  let secText = sec;
  if (min < 10) {
    minText = `0${min}`;
  }
  if (sec < 10) {
    secText = `0${sec}`;
  }
  const text = `${minText}:${secText}`;
  timerVisualisation.textContent = text;
  ipcRenderer.invoke('write-text-file', textFile, text);
  timerValue -= 1;
  if (timerValue >= 0) {
    timeout = setTimeout(timerShow, 1000);
  } else {
    ipcRenderer.invoke('play-sound', soundFile);
    if (endText === '') {
      timerVisualisation.textContent = '00:00';
      ipcRenderer.invoke('write-text-file', textFile, '00:00');
    } else {
      timerVisualisation.textContent = endText;
      ipcRenderer.invoke('write-text-file', textFile, endText);
    }
    started = false;
    paused = false;
    setTimer.textContent = 'Start';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const sound = document.getElementById('sound');
  const textSelect = document.getElementById('textFile');
  const endTextField = document.getElementById('endText');
  const clear = document.getElementById('clearTimer');

  setTimer = document.getElementById('setTimer');
  timerVisualisation = document.getElementById('timerVisualisation');

  const hours = document.getElementById('hours');
  const minutes = document.getElementById('minutes');
  const seconds = document.getElementById('seconds');

  for (let i = 0; i <= 24; i += 1) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    hours.appendChild(opt);
  }

  for (let i = 0; i < 60; i += 1) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    minutes.appendChild(opt);
  }

  for (let i = 0; i < 60; i += 1) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    seconds.appendChild(opt);
  }

  setTimer.addEventListener('click', () => {
    // console.log(sound.files[0].path);
    if (started) {
      if (paused) {
        timerShow();
        paused = false;
        setTimer.textContent = 'Pause';
      } else {
        clearTimeout(timeout);
        paused = true;
        setTimer.textContent = 'Start';
      }
    } else {
      if (sound.files.length > 0) {
        soundFile = sound.files[0].path;
      } else {
        soundFile = 'default';
      }
      if (textSelect.files.length > 0) {
        textFile = textSelect.files[0].path;
      } else {
        textFile = 'default.txt';
      }
      timerValue = (parseInt(hours.options[hours.selectedIndex].value, 10) * 60 * 60);
      timerValue += (parseInt(minutes.options[minutes.selectedIndex].value, 10) * 60);
      timerValue += parseInt(seconds.options[seconds.selectedIndex].value, 10);
      endText = endTextField.value;
      timerShow();
      started = true;
      setTimer.textContent = 'Pause';
    }
  });

  clear.addEventListener('click', () => {
    clearTimeout(timeout);
    timerValue = 0;
    setTimer.textContent = 'Start';
    timerVisualisation.innerHTML = '&nbsp;';
    started = false;
    paused = false;
  });
});
