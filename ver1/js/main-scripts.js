const games = ['minesweeper', 'anti-crossword', 'tetris'];
const gamesFactories = [(e, d) => new Minesweeper(e, d)];

let gameSlider, difficultySlider;
let playButton;
let currWindow;
let game = null;

function openWindow(name) {
    const windowToOpen = document.querySelector(`.main__window[data-window="${name}"]`);
    if (windowToOpen.classList.contains('main__window_modal')) {
        addClass(document.querySelector(`.main__window[data-window="${name}"]`),
            'main__window_active');
    } else {
        if (currWindow)
            removeClass(currWindow, 'main__window_active');
        currWindow = windowToOpen;
        addClass(currWindow, 'main__window_active');
    }
}

function closeModalWindow(name) {
    removeClass(document.querySelector(`.main__window[data-window="${name}"]`),
        'main__window_active');
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
        const gameI = gameSlider.chosen;

        if (gameI >= gamesFactories.length) {
            alert("К сожалению, данная игра пока в разработке.")
            return;
        }

        openWindow(games[gameI]);
        game = gamesFactories[gameI](currWindow, difficultySlider.chosen);
        game.win = () => {
            openWindow('win');
        };
        game.lose = () => {
            openWindow('lose');
        };
    })

    document.querySelectorAll('.main__home-button').forEach(b =>
        b.addEventListener('click', endGame));

    document.querySelectorAll('.main__to-home').forEach(el => {
        el.addEventListener('click', () => {
            endGame();
        });
    });

    window.addEventListener('resize', () => {
        if (game)
            game.resize();
    });

    document.querySelectorAll('.main__modal-close').forEach(el => {
       el.addEventListener('click', () => {
            closeModalWindow(el.getAttribute('data-window'));
       });
    });
});

function endGame() {
    if (game) {
        game.cleanup();
        game = null;
    }
    openWindow('selector');
}