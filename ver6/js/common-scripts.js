const VERSION = 6;

function addClass(el, className) {
    if (!el.classList.contains(className))
        el.classList.add(className);
}

function removeClass(el, className) {
    if (el.classList.contains(className))
        el.classList.remove(className);
}

function rndInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function shuffleArray(arr) {
    return arr
        .map(value => ({value, sort: Math.random()}))
        .sort((a, b) => a.sort - b.sort)
        .map(({value}) => value);
}

function isTouchDevice() {
    return window.matchMedia("(pointer: coarse)").matches;
}