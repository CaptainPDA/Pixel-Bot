
const MAX_WIDTH = 12;
const MAX_HEIGHT = 12;

class Grid {
   
    constructor(context) {

        this.layout = [];
        this.context = context;
        this.tileWidth = this.context.canvas.width / MAX_WIDTH;
        this.tileHeight = this.context.canvas.height / MAX_HEIGHT;

        this.initLayout();
    }

    /**
     * Create the bi dimensional array for the grid.
     */
    initLayout() {
        // Defaults
        let positionX = 0;
        let positionY = 0;

        let counter = 1;

        for (let rowIt = 0; rowIt < MAX_WIDTH; ++rowIt) {
            let row = [];
            
            // calculate Y position
            let offsetY = (rowIt === (MAX_HEIGHT - 1) ? -0.5 : 0.5);
            positionY = offsetY + (rowIt * this.tileHeight);

            for (let colIt = 0; colIt < MAX_HEIGHT; ++colIt) {
                // calculate X position
                
                let offsetX = (colIt === (MAX_WIDTH-1) ? -0.5 : 0.5);
                positionX = offsetX + (colIt  * this.tileWidth);

                let tile = new Tile({
                    id: counter,
                    width: this.tileWidth,
                    height: this.tileHeight,
                    color: COLOR_PALETTE[0],
                    positionX: positionX,
                    positionY: positionY,
                    context: this.context
                });
                
                row.push(tile);
                ++counter;
            }

            this.layout.push(row);
        }

    }

    /**
     * Draw
     */
    draw() {
        this.drawGrid();
        this.drawTiles();
    }

    /**
     * Draw Tiles
     */
    drawTiles() {
        this.layout.forEach((row, rowIdx) => {
            row.forEach((tile, colIdx) => {
                tile.draw();
            });
        });
    }

    /**
     * Draw Grid
     */
    drawGrid() {

        for (var x = 0; x <= MAX_WIDTH; x++) {
            let offsetX = (x === MAX_WIDTH ? -0.5 : 0.5);

            this.context.moveTo(offsetX + (x * this.tileWidth), 0);
            this.context.lineTo(offsetX + (x * this.tileWidth), this.context.canvas.offsetHeight);
        }
    
        for (var y = 0; y <= MAX_HEIGHT; y++) {
            let offsetY = (y === MAX_HEIGHT ? -0.5 : 0.5);

            this.context.moveTo(0, offsetY + (y * this.tileHeight));
            this.context.lineTo(this.context.canvas.offsetWidth, offsetY + (y * this.tileHeight));
        }

        this.context.strokeStyle = 'black';
        this.context.stroke();
    }

    /**
     * HandleMouseDown
     * @description: This Method is for handling mousedown event
     * @param: x:number, y:number, currentColor:string - Coordinates inside the canvas.
     */
    handleMouseDown(x, y, selectedColor) {
        this.handleCollition(x,y, selectedColor);
    }

    /**
     * handleCollition
     * @description: Check tile collitions on given coordinates and set tile color
     */
    handleCollition(x, y, selectedColor) {

        for (let row = 0; row < this.layout.length; ++row) {
            let stop = false;
            
            for (let col = 0; col < this.layout[row].length; ++col) {
                let tile = this.layout[row][col];


                if (tile.isColliding(x, y)) 
                {
                    tile.color = selectedColor;
                    stop = true;
                    break;
                }
            }

            if (stop) {
                break;
            }

        }

    }

    /**
     * Generate Code
     */
    generateCode() {
        let out = '!pb1.';

        this.layout.forEach( row => {
            row.forEach(tile => {
                out += (tile.color.title === 'eraser' ? 'z' : tile.color.title);
            });
        });

        return out;
    }
}