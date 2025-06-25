const antiCrosswordParams = {
    difficulties: [
        {
            wordRatio: 1.1,
            fieldSize: 5
        },
        {
            wordRatio: 1.2,
            fieldSize: 6
        },
        {
            wordRatio: 1.3,
            fieldSize: 7
        }
    ]
};

class AntiCrossword extends Game {
    constructor(el, difficulty) {
        super(el, difficulty);

        this.fieldEl = el.querySelector('.anti-crossword__field');

        this.size = antiCrosswordParams.difficulties[difficulty].fieldSize;
        this.wordRatio = antiCrosswordParams.difficulties[difficulty].wordRatio;

        this.fieldEl.style.gridTemplateColumns = `repeat(${this.size}, 1fr`;
        this.fieldEl.style.gridTemplateRows = `repeat(${this.size}, 1fr`;
        for (let i = 0; i < this.size ** 2; i++) {
            const cellEl = document.createElement("div");
            cellEl.classList.add('anti-crossword__cell');
            this.fieldEl.appendChild(cellEl);
        }

        this.minWordLen = 3;
        this.maxWordLen = Math.max(3, this.size - 1);
        // a strange looking formula that gives appropriate amount of words
        const wordCount = Math.max(3, this.size ** 2 /
            ((this.minWordLen + this.maxWordLen) / 2 - 1) * this.wordRatio);

        const field = [];
        for (let i = 0; i < this.size; i++) {
            field[i] = [];
            for (let j = 0; j < this.size; j++)
                field[i][j] = rndInt(0, 9);
        }

        this.words = [];
        for (let i = 0; i < wordCount; i++) {
            this.words[i] = {
                word: [],
                placed: false
            };
            const len = rndInt(this.minWordLen, this.maxWordLen);
            let alignment = rndInt(0, this.size);
            let cord = rndInt(0, this.size - len);
            const direction = rndInt(0, 2) === 0;
            for (let c = cord; c < cord + len; c++)
                this.words[i].word.push(direction ? field[c][alignment] : field[alignment][c]);

            let alreadyExists = false;
            for (let j = 0; j < i && !alreadyExists; j++)
                alreadyExists = this.words[j].word.toString() === this.words[i].word.toString();

            if (alreadyExists) {
                i--;
                this.words.pop();
            }
        }

        this.wordListEl = el.querySelector('.anti-crossword__word-list');

        this.wordListButton = el.querySelector('.anti-crossword__word-list-button');
        this.wordListButtonOnClick = () => {
            addClass(this.wordListEl, 'anti-crossword__word-list_open');
            this.updateWordList();
        };
        this.wordListButton.addEventListener('click', this.wordListButtonOnClick);

        this.wordListCloseButton = el.querySelector('.anti-crossword__word-list-close');
        this.wordListCloseButtonOnClick = () => {
            removeClass(this.wordListEl, 'anti-crossword__word-list_open');
        };
        this.wordListCloseButton.addEventListener('click', this.wordListCloseButtonOnClick);

        this.letterSelectorEl = el.querySelector('.anti-crossword__letter-selector');
        this.fieldOnClick = e => {
            let cellEl = e.target;
            if (cellEl.classList.contains('anti-crossword__letter'))
                cellEl = cellEl.parentNode;
            if (cellEl.classList.contains('anti-crossword__cell')) {
                this.choosingCellEl = cellEl;
                addClass(this.letterSelectorEl, 'anti-crossword__letter-selector_open');
            }
        };
        this.fieldEl.addEventListener('click', this.fieldOnClick);

        this.letterSelectorOnClick = e => {
            if (!e.target.classList.contains('anti-crossword__symbol'))
                return;
            let chosenLetter = Array.prototype.indexOf.call(this.letterSelectorEl.children, e.target);
            if (chosenLetter === 9)
                chosenLetter = -1;

            const i = Array.prototype.indexOf.call(this.fieldEl.children, this.choosingCellEl);
            const x = i % this.size;
            const y = Math.floor(i / this.size);
            this.field[x][y] = chosenLetter;

            this.choosingCellEl.innerHTML = '';
            if (chosenLetter >= 0) {
                const imgEl = document.createElement("img");
                imgEl.classList.add('anti-crossword__letter');
                imgEl.src = `ver${VERSION}/img/anticrossword/letter_${chosenLetter}.png`;
                this.choosingCellEl.appendChild(imgEl);
            }
            removeClass(this.letterSelectorEl, 'anti-crossword__letter-selector_open');

            if (this.updateWordPlaced()) {
                this.win();
                this.fieldEl.removeEventListener('click', this.fieldOnClick);
            }
        };

        this.letterSelectorEl.addEventListener('click', this.letterSelectorOnClick);

        this.field = [];
        for (let i = 0; i < this.size; i++) {
            this.field[i] = [];
            for (let j = 0; j < this.size; j++)
                this.field[i][j] = -1;
        }

        this.resize();
    }

    updateWordList() {
        while (this.wordListEl.children.length > 1)
            this.wordListEl.children[1].remove();

        for (const word of this.words) {
            const wordEl = document.createElement("div");
            wordEl.classList.add('anti-crossword__word');
            if (word.placed)
                wordEl.classList.add('anti-crossword__word_placed');
            for (const letterI of word.word) {
                const letterEl = document.createElement("img");
                letterEl.classList.add('anti-crossword__symbol');
                letterEl.src = `ver${VERSION}/img/anticrossword/letter_${letterI}.png`
                wordEl.appendChild(letterEl);
            }
            this.wordListEl.appendChild(wordEl);
        }
    }

    updateWordPlaced() {
        for (const word of this.words)
            word.placed = false;

        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const wh = [], wv = [];
                for (let i = 0; i < this.maxWordLen; i++) {
                    if (x + i < this.size) {
                        wh.push(this.field[x + i][y]);
                        this.markWordsAsPlaced(wh);
                    }
                    if (y + i < this.size) {
                        wv.push(this.field[x][y + i]);
                        this.markWordsAsPlaced(wv);
                    }
                }
            }
        }

        for (const word of this.words)
            if (!word.placed)
                return false;
        return true;
    }

    markWordsAsPlaced(word) {
        for (const w of this.words)
            if (w.word.toString() === word.toString())
                w.placed = true;
    }

    cleanup() {
        this.fieldEl.innerHTML = '';

        this.wordListButton.removeEventListener('click', this.wordListButtonOnClick);
        this.wordListCloseButton.removeEventListener('click', this.wordListCloseButtonOnClick);

        this.fieldEl.removeEventListener('click', this.fieldOnClick);
        this.letterSelectorEl.removeEventListener('click', this.letterSelectorOnClick);
    }

    resize() {

    }
}