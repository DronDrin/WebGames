let gameSlider, difficultySlider;

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
   currWindow = document.querySelector('.main__window_active');
   openWindow('selector');
});


function addClass(el, className) {
   if (!el.classList.contains(className))
      el.classList.add(className);
}

function removeClass(el, className) {
   if (el.classList.contains(className))
      el.classList.remove(className);
}