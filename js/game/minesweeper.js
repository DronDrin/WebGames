class Minesweeper extends Game {
    constructor(el, difficulty) {
        super(el, difficulty);
    }

    mine_lose() {
        this.lose();
    }

    mine_win() {
        this.win();
    }
}