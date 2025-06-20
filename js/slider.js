class Slider {
    constructor(element) {
        this.el = element;
        this.cursor = this.el.querySelector('.slider__cursor');
        this.chosen = -1;
        this.onchange = i => {};
        this.el.querySelector('.slider__body').addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('slider__item')) {
                const itemRect = e.target.getBoundingClientRect();
                const sliderRect = this.el.getBoundingClientRect();
                this.cursor.style.left = `${itemRect.x - sliderRect.x + this.el.scrollLeft - 10}px`;
                this.cursor.style.top = `${itemRect.y - sliderRect.y + this.el.scrollTop}px`;
                this.cursor.style.width = `${itemRect.width + 20}px`;
                this.cursor.style.height = `${itemRect.height}px`;
                this.chosen = Number(e.target.getAttribute('data-i'));
                this.onchange(this.chosen);
            }
        });
    }
}