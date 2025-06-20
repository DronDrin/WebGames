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

const longHoldThreshold = 600;

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
        this.leftToOpen = this.width * this.height - this.mines;

        let mouseDownTime, mouseHold = false, lastDownEvent, mouseInterrupted = false;
        const getEventCords =
            isTouchDevice() ? e => ({
                x: (e.touches.length === 0 ? e.changedTouches : e.touches)[0].pageX,
                y: (e.touches.length === 0 ? e.changedTouches : e.touches)[0].pageY
            })
            : e => ({
                x: e.clientX,
                y: e.clientY
            });
        this.mouseUp = e => {
            mouseHold = false;

            const currCords = getEventCords(e);
            const prevCords = getEventCords(lastDownEvent);
            if (Math.abs(currCords.x - prevCords.x) + Math.abs(currCords.y - prevCords.y) > 40) {
                return;
            }
            if (mouseInterrupted) {
                mouseInterrupted = false;
                return;
            }
            if (e.target.classList.contains('minesweeper__cell')) {
                const cell = e.target;
                const i = [...cell.parentNode.children].indexOf(cell);
                let open = !e.button;
                if (Date.now() - mouseDownTime > longHoldThreshold)
                    open = false;
                this.cellClick(cell, Math.floor(i / this.height), i % this.height, open);
            }
        };
        this.mouseDown = e => {
            mouseHold = true;
            lastDownEvent = e;
            mouseDownTime = Date.now();
        };
        this.contextMenu = e => {
            e.preventDefault();
            return false;
        };

        const mouseTimer = () => {
            setTimeout(() => mouseTimer(), 10);
            if (mouseHold && Date.now() - mouseDownTime > longHoldThreshold) {
                this.mouseUp(lastDownEvent);
                mouseInterrupted = true;
                if (navigator.mozVibrate)
                    navigator.mozVibrate(200);
                else
                    navigator.vibrate(200);
            }
        };
        mouseTimer();

        if (isTouchDevice()) {
            this.fieldEl.addEventListener('touchstart', this.mouseDown);
            this.fieldEl.addEventListener('touchend', this.mouseUp);
        } else {
            this.fieldEl.addEventListener('mouseup', this.mouseUp);
            this.fieldEl.addEventListener('mousedown', this.mouseDown);
        }
        this.fieldEl.addEventListener('contextmenu', this.contextMenu);
        this.lost = false;
    }

    cellClick(cell, x, y, open) {
        if (this.lost || cell.classList.contains('minesweeper__cell_open'))
            return;
        if (open) {
            if (cell.classList.contains('minesweeper__cell_flag'))
                return;
            cell.classList.add('minesweeper__cell_open');
            if (!this.field)
                this.generateField(x, y);

            const val = this.field[x][y];
            if (val > 0 && val < 9) {
                const numEl = document.createElement("div");
                numEl.classList.add('minesweeper__num');
                numEl.classList.add(`minesweeper__num_${val}`);
                numEl.innerText = val;
                cell.appendChild(numEl);
            } else if (val === 9) {
                this.loseAnimation(x, y);
            } else
                this.propagateArea(x, y);
            if (val !== 9)
                this.cellOpened();
        } else {
            if (!this.field)
                return;
            if (cell.classList.contains('minesweeper__cell_flag')) {
                cell.classList.remove('minesweeper__cell_flag');
                cell.innerHTML = '';
                this.minesSetByPlayer--;
            } else {
                cell.classList.add('minesweeper__cell_flag');
                const imgEl = document.createElement("img");
                imgEl.classList.add('minesweeper__flag');
                imgEl.src = `ver${VERSION}/img/minesweeper/flag.png`;
                cell.appendChild(imgEl);
                this.minesSetByPlayer++;
            }
            this.updateMinesLeft();
        }
    }

    loseAnimation(x, y) {
        this.lost = true;

        for (let i = 0; i < this.width; i++)
            for (let j = 0; j < this.height; j++)
                setTimeout(() => {
                    const cell = this.fieldEl.children[this.height * i + j];
                    if (this.field[i][j] === 9) {
                        addClass(cell, 'minesweeper__cell_mine');
                        if (i === x && j === y)
                            addClass(cell, 'minesweeper__cell_lost')

                        const mineEl = document.createElement('img');
                        mineEl.classList.add('minesweeper__mine');
                        mineEl.src = `ver${VERSION}/img/minesweeper/mine.png`;
                        cell.appendChild(mineEl);
                    } else {
                        addClass(cell, 'minesweeper__cell_not-mine');
                    }
                }, Math.sqrt(Math.abs(i - x) ** 2 + Math.abs(j - y) ** 2) * 30);
        setTimeout(() => this.lose(), this.width * 30 + 100);
    }

    cellOpened() {
        this.leftToOpen--;
        if (this.leftToOpen <= 0)
            this.win();
    }

    propagateArea(x, y) {
        setTimeout(() => {
            this.getAround(x, y)
                .forEach(c => {
                    const cell = this.fieldEl.children[c.x * this.height + c.y];
                    if (cell.classList.contains('minesweeper__cell_open'))
                        return;
                    cell.classList.add('minesweeper__cell_open');
                    const val = this.field[c.x][c.y];
                    if (val === 0)
                        this.propagateArea(c.x, c.y);
                    else if (val < 9) {
                        const numEl = document.createElement("div");
                        numEl.classList.add('minesweeper__num');
                        numEl.classList.add(`minesweeper__num_${val}`);
                        numEl.innerText = val;
                        cell.appendChild(numEl);
                    }
                    this.cellOpened();
                })
        }, 40);
    }

    generateField(firstX, firstY) {
        do {
            this.field = [];
            for (let i = 0; i < this.width; i++)
                this.field[i] = [];

            let cords = [];
            for (let i = 0; i < this.width; i++)
                for (let j = 0; j < this.height; j++)
                    cords.push({x: i, y: j});
            cords = shuffleArray(cords);

            for (let i = 0; i < this.mines; i++)
                this.field[cords[i].x][cords[i].y] = 9;

            for (let i = 0; i < this.width; i++)
                for (let j = 0; j < this.height; j++) {
                    if (this.field[i][j] !== 9)
                        this.field[i][j] = this.getAround(i, j)
                            .filter(c => this.field[c.x][c.y] === 9)
                            .length;
                }

        } while (this.field[firstX][firstY] !== 0);
    }

    getAround(x, y) {
        const around = [];

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                around.push({x: x + i, y: y + j});
            }
        }

        return around.filter(c => c.x >= 0 && c.y >= 0 && c.x < this.width && c.y < this.height);
    }

    updateMinesLeft() {
        if (this.mines - this.minesSetByPlayer >= 0)
            this.minesLeftEl.innerText = this.mines - this.minesSetByPlayer;
        else
            this.minesLeftEl.innerText = "Х";
    }

    resize() {
        const xPadding = 10;
        const yPadding = 120;
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

        this.fieldEl.style.fontSize = (Math.max(target.height / this.height, 30) / 1.8) + 'px';
    }


    cleanup() {
        this.fieldEl.innerHTML = '';
        if (isTouchDevice()) {
            this.fieldEl.removeEventListener('touchstart', this.mouseDown);
            this.fieldEl.removeEventListener('touchend', this.mouseUp);
        } else {
            this.fieldEl.removeEventListener('mouseup', this.mouseUp);
            this.fieldEl.removeEventListener('mousedown', this.mouseDown);
        }
        this.fieldEl.removeEventListener('contextmenu', this.contextMenu);
    }
}