const minesweeperDifficulties = [
    {
        width: 9,
        height: 9,
        mines: 10
    },
    {
        width: 16,
        height: 16,
        mines: 40
    },
    {
        width: 30,
        height: 16,
        mines: 99
    },
];

class Minesweeper extends Game {
    constructor(el, difficulty) {
        super(el, difficulty);
        this.width = minesweeperDifficulties[difficulty].width;
        this.height = minesweeperDifficulties[difficulty].height;
        this.mines = minesweeperDifficulties[difficulty].mines;

        this.fieldEl = el.querySelector('.minesweeper__field');
        this.minesLeftEl = el.querySelector('.minesweeper__mines > .minesweeper__value');

        this.minesSetByPlayer = 0;
        this.updateMinesLeft();

        this.field = null;

        this.fieldEl.style.gridTemplateColumns = `repeat(${this.width}, 1fr`;
        this.fieldEl.style.gridTemplateRows = `repeat(${this.height}, 1fr`;
        for (let i = 0; i < this.width * this.height; ++i) {
            const cell = document.createElement("div");
            addClass(cell, "minesweeper__cell");
            this.fieldEl.appendChild(cell);
        }
        this.resize();
    }

    generateField(firstX, firstY) {
    }

    updateMinesLeft() {
        if (this.mines - this.minesSetByPlayer >= 0)
            this.minesLeftEl.innterText = this.mines - this.minesSetByPlayer;
        else
            this.minesLeftEl.innterText = "Х";
    }

    resize() {
        const xPadding = 150;
        const yPadding = 100;
        const aspectRatio = this.width / this.height;

        const byWidth = {
            width: window.innerWidth - xPadding * 2
        };
        byWidth.height = byWidth.width / aspectRatio;

        const byHeight = {
            height: window.innerHeight - yPadding * 2
        }
        byHeight.width = byHeight.height * aspectRatio;

        const target = byWidth.height <= window.innerHeight - yPadding * 2 ?
            byWidth : byHeight;

        this.fieldEl.style.width = target.width + 'px';
        this.fieldEl.style.height = target.height + 'px';
    }
}