import { changeTheme, onOfSounds } from './index.js'

// создание элемента с классом
const createElement = (tag, className) => {
    const element = document.createElement(tag);
    if (className) {
        element.classList.add(className);
    }
    return element;
  }

  // создание кнопки
  const createButton = (className, text) => {
    const button = createElement('button', className);
    button.textContent = text;
    return button;
  }

  // создание радиокнопок
  const createInputLabel = (inputId, labelText) => {
    const label = createElement('label', 'size');
    const input = createElement('input');
    input.type = 'radio';
    input.name = 'size';
    input.id = inputId;
    label.appendChild(input);
    label.insertAdjacentHTML('beforeend', labelText);
    return label;
  }

  // создание выпадающего списка
  const createSelect = (className, name, id) => {
    const select = createElement('select', className);
    select.name = name;
    select.id = id;
    return select;
  }

  const createOption = (value, text, select) => {
    const option = createElement('option', 'option');
    option.value = value;
    option.textContent = text;
    select.append(option);
  }

  const createLabel = (className, selectName, labelText) => {
    const label = createElement('label', className);
    label.htmlFor = selectName;
    label.textContent = labelText;
    return label;
  }

  const createHeader = () => {
    const header = createElement('header', 'header');
    const headerContainer = createElement('div', 'header-container');
    const headerContent = createElement('div', 'header-content');
    const gameTitle = createElement('h1', 'game-title');
    gameTitle.textContent = 'NONOGRAMS';
    const iconContainer = createElement('div', 'icon-container');
    const themeIcon = createElement('img', 'theme-icon');
    themeIcon.src = './assets/svg/dark_theme.svg';
    themeIcon.alt = 'theme_toggle_icon';
    themeIcon.addEventListener('click', changeTheme);

    const musicIcon = createElement('img', 'music-icon');
    musicIcon.src = './assets/svg/icon_music.svg';
    musicIcon.alt = 'music_icon';
    musicIcon.addEventListener('click', onOfSounds);

    iconContainer.append(themeIcon, musicIcon);
    headerContent.append(gameTitle, iconContainer);
    headerContainer.appendChild(headerContent);
    header.appendChild(headerContainer);

    return header;
}

  const createFooter = () => {
    const footer = createElement('footer', 'footer');
    const footerContainer = createElement('div', 'footer-container');
    const footerContent = createElement('div', 'footer-content');
    const footerLink = createElement('a', 'footer-link');
    footerLink.href = 'https://github.com/SplitCode/';
    const githubIcon = createElement('img', 'github-icon');
    githubIcon.src = './assets/svg/github_icon.svg';
    githubIcon.alt = 'github-icon';
    const visitText = createElement('p', 'visit');
    visitText.textContent = 'Visit my GitHub';
    const yearText = createElement('p', 'year');
    yearText.textContent = '© 2024';
    const carrotsLogo = createElement('img', 'carrots-logo');
    carrotsLogo.src = './assets/svg/carrot_icon.svg';
    carrotsLogo.alt = 'carrots-logo';

    footerLink.appendChild(githubIcon);
    footerLink.appendChild(visitText);

    footerContent.append(footerLink, yearText, carrotsLogo);
    footerContainer.appendChild(footerContent);
    footer.appendChild(footerContainer);

    return footer;
  }

  export { createElement, createButton, createInputLabel, createSelect, createLabel, createOption, createHeader, createFooter };