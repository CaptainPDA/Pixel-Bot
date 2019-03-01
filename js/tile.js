class Tile {

    constructor (data) {
        this.id = data && data.id !== null ? data.id : null;
        this.color = data && data.color ? data.color : null;
        this.width = data && data.width ? data.width : null;
        this.height = data && data.height ? data.height : null;
        this.positionX = data && data.positionX !== null ? data.positionX : null;
        this.positionY = data && data.positionY !== null ? data.positionY : null;
        this.context = data && data.context ? data.context : null;
        this.type = data && data.type ? data.type : 'color';

        this._eraserImage = new Image();
        this._eraserImage.src = './assets/eraser.svg';
    }


    /**
     * Draw
     */
    draw() {
        if (this.type === 'color' && this.color !== null) {
            this.context.fillStyle = this.color.color;
            this.context.fillRect(this.positionX, this.positionY, this.width, this.height);
        } else if (this.type === 'eraser') {
            this.context.drawImage(this._eraserImage, this.positionX, this.positionY, this.width, this.height);
        }
    }

    /**
     * isColliding
     */
    isColliding(x, y) {
        return  x >= this.positionX && x <= (this.positionX + this.width) && 
                y >= this.positionY && y <= (this.positionY + this.height);
    }
}