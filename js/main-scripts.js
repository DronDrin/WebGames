let gameSlider, difficultySlider;
let playButton;
let currWindow;

function openWindow(name) {
    if (currWindow)
        removeClass(currWindow, 'main__window_active');
    currWindow = document.querySelector(`.main__window[data-window="${name}"]`)
    addClass(currWindow, 'main__window_active');
}

window.addEventListener('load', () => {
    gameSlider = new Slider(document.getElementById('gameSlider'));
    difficultySlider = new Slider(document.getElementById('difficultySlider'));
    playButton = document.getElementById('playButton');

    currWindow = document.querySelector('.main__window_active');
    openWindow('selector');

    gameSlider.onchange = i => {
        document.querySelectorAll('.main__rules')
            .forEach(rules => removeClass(rules, 'main__rules_active'));
        addClass(document.querySelector(`.main__rules:nth-child(${i + 1})`), 'main__rules_active');
    };

    playButton.addEventListener('click', () => {

    });
});


function addClass(el, className) {
    if (!el.classList.contains(className))
        el.classList.add(className);
}

function removeClass(el, className) {
    if (el.classList.contains(className))
        el.classList.remove(className);
}