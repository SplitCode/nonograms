console.log("Please don't forget to clear the Local storage!");

import pictureMatrix from "./pictures.js";
import {
  createElement,
  createButton,
  createInputLabel,
  createSelect,
  createLabel,
  createOption,
  createHeader,
  createFooter,
} from "./htmlGenerator.js";

document.body.classList.add("light-theme");

let isSoundEnabled = true;
const blackSound = new Audio("./assets/sounds/blackSound.mp3");
const crossSound = new Audio("./assets/sounds/crossSound.mp3");
const winSound = new Audio("./assets/sounds/winSound.mp3");
const removeSound = new Audio("./assets/sounds/removeSound.mp3");

let blackSoundVolume = 1;
let crossSoundVolume = 1;
let winSoundVolume = 1;
let removeSoundVolume = 1;

let currentSize = 5;
let puzzleMatrix = pictureMatrix[0].matrix;
let isStartTimer = false;
let hintShown = false;

console.log('Solution:', puzzleMatrix);

const getSizeName = (size) => {
  switch (size) {
    case 5:
      return "Easy";
    case 10:
      return "Medium";
    case 15:
      return "Hard";
    default:
      return "Unknown size";
  }
};

const createMatrix = (rows, cols) => {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
};

let userMatrix = createMatrix(puzzleMatrix.length, puzzleMatrix[0].length);
// console.log(userMatrix)

const updateMatrix = (rowIndex, colIndex, isRightClick) => {
  const row = userMatrix[rowIndex];

  if (row && row[colIndex] !== undefined) {
    if (isRightClick) {
      userMatrix[rowIndex][colIndex] = 2;
    } else {
      userMatrix[rowIndex][colIndex] =
        userMatrix[rowIndex][colIndex] === 1 ? 0 : 1;
    }
  }
};

// сброс игры
const resetGame = () => {
  removeRow();
  userMatrix = createMatrix(puzzleMatrix.length, puzzleMatrix[0].length);
  hintShown = false;
  stopTimer();
  clearInterval(timerInterval);
  seconds = 0;
  minutes = 0;
  timer.textContent = "00:00";
  const rowsItem = document.querySelectorAll(".row-item");
  rowsItem.forEach((row) => {
    row.style.cursor = "pointer";
    row.disabled = false;
  });
  hintShown = false;
};

const startNewGame = () => {
  stopTimer();
  clearInterval(timerInterval);
  seconds = 0;
  minutes = 0;
  timer.textContent = "00:00";

  // Очистка поля и сброс матрицы
  removeRow();
  userMatrix = createMatrix(puzzleMatrix.length, puzzleMatrix[0].length);

  // Запуск новой игры
  isStartTimer = false;
  hintShown = false;
};

// очищение поля
const removeRow = () => {
  const rowItems = document.querySelectorAll(".row-item");
  rowItems.forEach((rowItem) => {
    rowItem.classList.remove("black");
    rowItem.classList.remove("cross");
  });
};

// сохранение ркорда
const saveRecord = (record) => {
  const records = JSON.parse(localStorage.getItem("records")) || [];
  records.push(record);
  records.sort((a, b) => a.timeInSeconds - b.timeInSeconds);
  if (records.length > 5) {
    records.shift(); // Оставляем только 5 последних рекордов
  }
  localStorage.setItem("records", JSON.stringify(records));
};

// проверка матриц на совпадение и вызов модального окна
const checkMatrix = () => {
  for (let i = 0; i < puzzleMatrix.length; i += 1) {
    for (let j = 0; j < puzzleMatrix[i].length; j += 1) {
      if (userMatrix[i][j] !== 2 && puzzleMatrix[i][j] !== userMatrix[i][j]) {
        return false;
      }
    }
  }

  // Остановить таймер
  clearInterval(timerInterval);

  // Время в секунды
  const timeInSeconds = minutes * 60 + seconds;

  // Сохранить результат в рекорды
  saveRecord({
    name: pictureButton.value,
    size: getSizeName(currentSize),
    timeInSeconds
  });

  // Показать модалку
  createWinModal(timeInSeconds);
  return true;
};

//добавление/удаление крестика или закрашивание при нажатии
const addRowItemClickHandler = (rowItem, rowIndex, colIndex) => {
  const addBlack = (e) => {
    if (e.button === 0) {
      updateMatrix(rowIndex, colIndex, false);
      // console.log(userMatrix)
      if (checkMatrix()) {
        winSound.play();
      }
      if (rowItem.classList.contains("cross")) {
        rowItem.classList.remove("cross");
        rowItem.classList.add("black");
        blackSound.play();
      } else if (rowItem.classList.contains("black")) {
        rowItem.classList.remove("black");
        removeSound.play();
      } else {
        rowItem.classList.add("black");
        blackSound.play();
      }
      if (!isStartTimer) {
        startTimer();
      }
    }
  };

  rowItem.addEventListener("click", addBlack);

  const addCross = (e) => {
    e.preventDefault();
    updateMatrix(rowIndex, colIndex, true);
    // console.log(userMatrix)

    if (rowItem.classList.contains("black")) {
      rowItem.classList.remove("black");
      rowItem.classList.add("cross");
      crossSound.play();
      updateMatrix(rowIndex, colIndex, true);
    } else if (rowItem.classList.contains("cross")) {
      rowItem.classList.remove("cross");
      removeSound.play();
      updateMatrix(rowIndex, colIndex, true);
    } else {
      rowItem.classList.add("cross");
      crossSound.play();
      updateMatrix(rowIndex, colIndex, true);
    }
    if (!isStartTimer) {
      startTimer();
    }
  };
  rowItem.addEventListener("contextmenu", addCross);
};

const createRowHint = (container, labelText, size) => {
  const rowHintItem = createElement("div", "row-hint-item");
  if (size === 10) {
    rowHintItem.classList.add("row-small");
  }
  if (size === 15) {
    rowHintItem.classList.add("row-smaller");
  }
  rowHintItem.innerHTML = `<label>${labelText}</label>`;
  container.append(rowHintItem);
};

const createColHint = (container, labelText, size) => {
  const colHintItem = createElement("div", "col-hint-item");
  if (size === 10) {
    colHintItem.classList.add("item-small");
  }
  if (size === 15) {
    colHintItem.classList.add("item-smaller");
  }
  colHintItem.innerHTML = `<label>${labelText}</label>`;
  container.append(colHintItem);
};

const createGamePlay = (size, matrix) => {
  const gameContainer = createElement("div", "game-container");
  const rowHints = createElement("div", "row-hints");
  if (size === 10) {
    rowHints.classList.add("tall");
  }
  if (size === 15) {
    rowHints.classList.add("taller");
  }
  const colHints = createElement("div", "col-hints");

  const counters = { row: {}, col: {} };
  const hintsArray = { row: [], col: [] };

  for (let i = 0; i < matrix.length; i += 1) {
    const colHint = createElement("div", "col-hint");
    hintsArray.col.push(colHint);
    colHints.append(colHint);

    const row = createElement("div", "row");

    for (let j = 0; j < matrix[i].length; j += 1) {
      const rowItem = createElement("button", "row-item");
      if (size === 10) {
        rowItem.classList.add("small");
      }
      if (size === 15) {
        rowItem.classList.add("smaller");
      }
      row.append(rowItem);

      addRowItemClickHandler(rowItem, i, j);

      if (matrix[i][j] === 1) {
        counters.row[i] = (counters.row[i] ?? 0) + 1;
        counters.col[j] = (counters.col[j] ?? 0) + 1;
        if (matrix.length - 1 === i) {
          createRowHint(hintsArray.row[j], counters.col[j], size);
        }
        if (matrix[i].length - 1 === j) {
          createColHint(hintsArray.col[i], counters.row[i], size);
        }
      } else {
        if (counters.col[j] > 0) {
          createRowHint(hintsArray.row[j], counters.col[j], size);
          counters.col[j] = 0;
        }
        if (counters.row[i] > 0) {
          createColHint(hintsArray.col[i], counters.row[i], size);
          counters.row[i] = 0;
        }
      }
      if (i === 0) {
        const rowHint = createElement("div", "row-hint");
        if (size === 10) {
          rowHint.classList.add("row-small");
        }
        if (size === 15) {
          rowHint.classList.add("row-smaller");
        }
        hintsArray.row.push(rowHint);
        rowHints.append(rowHint);
      }
      gameContainer.append(row);
    }
  }

  return { gameContainer, rowHints, colHints };
};

// включение/выключение звука
export const onOfSounds = () => {
  const musicIcon = document.querySelector('.music-icon');
  const body = document.body;
  if (isSoundEnabled) {
    // Сохраняем текущие значения громкости
    blackSoundVolume = blackSound.volume;
    crossSoundVolume = crossSound.volume;
    winSoundVolume = winSound.volume;
    removeSoundVolume = removeSound.volume;

    // Устанавливаем громкость в ноль
    blackSound.volume = 0;
    crossSound.volume = 0;
    winSound.volume = 0;
    removeSound.volume = 0;

    if (body.classList.contains("light-theme")) {
      musicIcon.src = "./assets/svg/icon_no_music.svg";
    } else {
      musicIcon.src = "./assets/svg/icon_no_music_dark.svg";
    }

    isSoundEnabled = false;
  } else {
    // Восстанавливаем громкость до сохраненных значений
    blackSound.volume = blackSoundVolume;
    crossSound.volume = crossSoundVolume;
    winSound.volume = winSoundVolume;
    removeSound.volume = removeSoundVolume;

    if (body.classList.contains("light-theme")) {
      musicIcon.src = "./assets/svg/icon_music.svg";
    } else {
      musicIcon.src = "./assets/svg/icon_music_dark.svg";
    }

    isSoundEnabled = true;

  }
};

// смена темы
export const changeTheme = () => {
  const body = document.body;
  const themeIcon = document.querySelector(".theme-icon");
  const musicIcon = document.querySelector(".music-icon");
  const carrotsLogo = document.querySelector(".carrots-logo");
  const githubIcon = document.querySelector(".github-icon");

  if (body.classList.contains("light-theme")) {
    body.classList.remove("light-theme");
    body.classList.add("dark-theme");
    themeIcon.src = "./assets/svg/light_theme_dark.svg";
    carrotsLogo.src = "./assets/svg/carrot_icon_dark.svg";
    githubIcon.src = "./assets/svg/github_icon_dark.svg";
    if (isSoundEnabled) {
      musicIcon.src = "./assets/svg/icon_music_dark.svg";
    } else {
      musicIcon.src = "./assets/svg/icon_no_music_dark.svg";
    }

  } else {
    body.classList.remove("dark-theme");
    body.classList.add("light-theme");
    themeIcon.src = "./assets/svg/dark_theme.svg";
    carrotsLogo.src = "./assets/svg/carrot_icon.svg";
    githubIcon.src = "./assets/svg/github_icon.svg";

    if (isSoundEnabled) {
      musicIcon.src = "./assets/svg/icon_music.svg";
    } else {
      musicIcon.src = "./assets/svg/icon_no_music.svg";
    }
  }
};

// показать решение
const chitSolution = () => {
  if (currentMatrix && !hintShown) {
    const rows = document.querySelectorAll(".row");
    rows.forEach((row, rowIndex) => {
      const rowItemValue = currentMatrix[rowIndex];

      rowItemValue.forEach((value, colIndex) => {
        if (value === 1) {
          const rowItem = row.children[colIndex];
          rowItem.classList.add("black");
        } else {
          const rowItem = row.children[colIndex];
          rowItem.classList.remove("black");
        }
      });
    });
    hintShown = true;
    const rowsItem = document.querySelectorAll(".row-item");
    rowsItem.forEach((row) => {
      row.style.cursor = "default";
      row.disabled = true;
      stopTimer();
      clearInterval(timerInterval);
    });
  }
};

// создание всего игрового интерфейса

// Создание header
const header = createHeader();

// Создание section
const section = createElement("section", "section");

// Создание nav
const nav = createElement("nav", "nav");
const navMenu = createElement("div", "nav-menu");

// Создание таймера
const timerContainer = createElement("div", "timer-container");
const timer = createElement("span", "time");
timer.id = "timer";
timer.textContent = "00:00";

timerContainer.appendChild(timer);

let timerInterval;
let seconds = 0;
let minutes = 0;

const startTimer = () => {
  if (!timerInterval) {
    timerInterval = setInterval(() => {
      seconds += 1;
      if (seconds === 60) {
        seconds = 0;
        minutes += 1;
      }

      timer.textContent = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }, 1000);
  }
};

// остановка таймера (криво работает?)
const stopTimer = () => {
  clearInterval(timerInterval);
  timerInterval = null;
};

// Создание кнопок для изменени размеров поля
const sizeContainer = createElement("div", "size-container");
const sizeButton = createSelect("nav-button", "size", "size-select");
createOption("5", "Easy", sizeButton);
createOption("10", "Medium", sizeButton);
createOption("15", "Hard", sizeButton);

const updateSizeOptions = (selectedSize) => {
  sizeButton.innerHTML = "";
  const sizes = [5, 10, 15];
  sizes.forEach((size) => {
    createOption(size, getSizeName(size), sizeButton);
  });
  sizeButton.value = selectedSize.toString();
};


sizeButton.addEventListener("change", (event) => {
  const choosedSize = parseInt(event.target.value);
  currentSize = choosedSize;
  choosePicture(choosedSize);
  puzzleMatrix = pictureMatrix.find(
    (picture) => picture.name === pictureButton.value
  ).matrix;
  startNewGame();
  console.log('Solution:', puzzleMatrix);
});

// переключение картинки
const pictureButton = createSelect("nav-button", "picture", "picture");

const choosePicture = (size, currentUserMatrix) => {
  pictureButton.innerHTML = "";
  const picturesForSize = pictureMatrix.filter(
    (picture) => picture.size === size
  );
  picturesForSize.forEach((picture) => {
    createOption(picture.name, picture.name, pictureButton);
  });
  if (picturesForSize.length > 0) {
    currentMatrix = picturesForSize[0].matrix; // Устанавливаем первую матрицу для выбранного размера
    updateGameField(size, currentMatrix);
    if (!currentUserMatrix) { // Проверка на наличие матрицы пользователя
      userMatrix = createMatrix(currentMatrix.length, currentMatrix[0].length); // Сброс матрицы, если она не передана
    }
  }
};

let currentMatrix;
pictureButton.addEventListener("change", () => {
  currentSize = pictureMatrix.find(
    (picture) => picture.name === pictureButton.value
  ).size;
  currentMatrix = pictureMatrix.find(
    (picture) => picture.name === pictureButton.value
  ).matrix;

  if (currentMatrix) {
    console.log('Solution:', currentMatrix);
    updateGameField(currentSize, currentMatrix);
    puzzleMatrix = pictureMatrix.find(
      (picture) => picture.name === pictureButton.value
    ).matrix; // обновляем puzzleMatrix
    startNewGame();
  }

  userMatrix = createMatrix(currentMatrix.length, currentMatrix[0].length); // сброс матрицы
  clearInterval(timerInterval);
});

const randomButton = createButton("nav-button", "Random Game");
randomButton.addEventListener("click", () => {
  const sizes = [5, 10, 15];
  const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

  const pictures = pictureMatrix.filter((picture) => picture.size === randomSize);
  const randomPicture = pictures[Math.floor(Math.random() * pictures.length)];

  sizeButton.value = randomSize;
  sizeButton.dispatchEvent(new Event("change"));
  pictureButton.value = randomPicture.name;
  // console.log(randomPicture.name)

  currentSize = randomSize;
  currentMatrix = randomPicture.matrix;
  puzzleMatrix = currentMatrix;
  // console.log('Solution:', puzzleMatrix);

  // Обновление игрового поля
  updateGameField(currentSize, currentMatrix);

  // Обновление матрицы пользователя
  userMatrix = createMatrix(currentMatrix.length, currentMatrix[0].length);

  // Сброс таймера и запуск новой игры
  startNewGame();
});

const chitButton = createButton("nav-button", "Solution");
chitButton.addEventListener("click", chitSolution);

sizeContainer.append(sizeButton, pictureButton, randomButton, chitButton);

// Создание кнопок
const buttonsContainer = createElement("div", "buttons-container");
// const pictureLabel = createLabel('picture-label', 'picture', 'Select picture');

const saveButton = createButton("nav-button", "Save Game");
const saveToLocalStorage = () => {
  const gameData = {
    currentSize,
    puzzleMatrix,
    userMatrix,
    isStartTimer,
    hintShown,
    seconds,
    minutes,
    name: pictureButton.value,
    size: sizeButton.value,
  }
  localStorage.setItem('currentData', JSON.stringify(gameData));
}

saveButton.addEventListener('click', saveToLocalStorage);

const continueButton = createButton("nav-button", "Continue Last Game");
const getFromLocalStorage = () => {
  const savedGameData = localStorage.getItem("currentData");
  if (savedGameData) {
    const gameData = JSON.parse(savedGameData);

    currentSize = gameData.currentSize;
    puzzleMatrix = gameData.puzzleMatrix;
    userMatrix = gameData.userMatrix;
    isStartTimer = gameData.isStartTimer;
    hintShown = gameData.hintShown;
    seconds = gameData.seconds;
    minutes = gameData.minutes;

    // Обновление значения sizeButton и списка опций в sizeButton
    updateSizeOptions(currentSize);

    // Обновление значения pictureButton и списка опций в pictureButton
    choosePicture(currentSize, userMatrix); // Передача текущей матрицы пользователя

    pictureButton.value = gameData.name;

    updateGameField(currentSize, puzzleMatrix); // Обновление игрового поля
    const rows = document.querySelectorAll(".row");
    rows.forEach((row, rowIndex) => {
      const rowItemValue = userMatrix[rowIndex];
      rowItemValue.forEach((value, colIndex) => {
        const rowItem = row.children[colIndex];
        if (value === 1) {
          rowItem.classList.add("black");
        } else if (value === 2) {
          rowItem.classList.add("cross");
        } else {
          // rowItem.classList.toggle("black", userMatrix[rowIndex][colIndex] === 1);
        }
      });
    });

    startTimer(); // Запуск таймера
  } else {
    alert("No saved game data found.");
  }
};

continueButton.addEventListener('click', getFromLocalStorage);

const resetButton = createButton("nav-button", "Reset Game");
resetButton.addEventListener("click", () => {
  resetGame();
});

const recordsButton = createButton("nav-button", "Records");

const createRecordsModal = () => {
  const records = JSON.parse(localStorage.getItem("records")) || [];

  // Объявление функции formatTime в начале функции createRecordsModal
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  const modal = createElement("div", "modal");
  modal.classList.add("visible");
  const modalContent = createElement("div", "modal-content");
  const modalTitle = createElement("h4", "modal-title");
  modalTitle.textContent = "Records";

  const table = createElement("table", "records-table");
  const tableHeader = createElement("tr", "records-header");

  const headerClasses = ["place-header", "puzzle-name-header", "level-header", "time-header"];

["Place", "Puzzle Name", "Level", "Time"].forEach((headerText, index) => {
  const th = createElement("th", headerClasses[index]);
  th.textContent = headerText;
  tableHeader.appendChild(th);
});

table.appendChild(tableHeader);

  records.forEach((record, index) => {
    const tr = createElement("tr", "records-row");
    const placeCell = createElement("td", "place-cell");
    placeCell.textContent = (index + 1).toString();
    const puzzleNameCell = createElement("td", "name-cell");
    puzzleNameCell.textContent = record.name;
    const levelCell = createElement("td", "level-cell");
    levelCell.textContent = record.size;
    const timeCell = createElement("td", "time-cell");
    timeCell.textContent = formatTime(record.timeInSeconds);

    tr.appendChild(placeCell);
    tr.appendChild(puzzleNameCell);
    tr.appendChild(levelCell);
    tr.appendChild(timeCell);
    table.appendChild(tr);
  });

  const modalButton = createButton("modal-button", "Close");

  modalButton.addEventListener("click", () => {
    modal.classList.remove("visible");
    document.body.removeChild(modal);
  });

  modalContent.appendChild(modalTitle);
  modalContent.appendChild(table);
  modalContent.appendChild(modalButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
};

recordsButton.addEventListener("click", createRecordsModal);
buttonsContainer.append(saveButton, continueButton, resetButton, recordsButton);

// Добавление в navMenu
navMenu.append(timerContainer, sizeContainer, buttonsContainer);
nav.appendChild(navMenu);

// Создание игрового поля
const main = createElement("main", "main");
const mainContainer = createElement("div", "main-container");

const top = createElement("div", "top");
const { rowHints, colHints, gameContainer } = createGamePlay(
  currentSize,
  puzzleMatrix
);
top.appendChild(rowHints);
const bottom = createElement("div", "bottom");
bottom.append(gameContainer, colHints);
mainContainer.append(top, bottom);
main.appendChild(mainContainer);

// Добавление в секцию
section.append(nav, main);

// Создание footer
const footer = createFooter();

// Добавление на страницу
document.body.append(header, section, footer);

// создание модального окна при выигрыше
const createWinModal = (timeInSeconds) => {
  const modal = createElement("div", "modal");
  modal.classList.add("visible");
  const modalContent = createElement("div", "modal-content");
  const modalTitle = createElement("h4", "modal-title");
  modalTitle.textContent = "Great!";
  const modalText = createElement("p", "modal-text");
  modalText.textContent = `You have solved the nonogram in:`;
  const modalTime = createElement("p", "modal-time");
  modalTime.textContent = `${timeInSeconds} seconds!`;
  const modalButton = createButton("modal-button", "Play Again!");

  modalButton.addEventListener("click", () => {
    modal.classList.remove("visible");
    document.body.removeChild(modal);
    startNewGame();
  });

  modalContent.appendChild(modalTitle);
  modalContent.appendChild(modalText);
  modalContent.appendChild(modalTime);
  modalContent.appendChild(modalButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
};

// обновление игрового поля
const updateGameField = (size, puzzleMatrix) => {
  const oldGameContainer = document.querySelector(".game-container");
  const oldRowHints = document.querySelector(".row-hints");
  const oldColHints = document.querySelector(".col-hints");

  const { gameContainer, rowHints, colHints } = createGamePlay(
    size,
    puzzleMatrix
  );

  oldGameContainer.parentNode.replaceChild(gameContainer, oldGameContainer);
  oldRowHints.parentNode.replaceChild(rowHints, oldRowHints);
  oldColHints.parentNode.replaceChild(colHints, oldColHints);
};

document.addEventListener("DOMContentLoaded", () => {
  choosePicture(currentSize);
});
