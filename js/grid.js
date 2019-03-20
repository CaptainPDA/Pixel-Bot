
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
     * Create the bidimensional array for the grid.
     */
    initLayout() {
        // Defaults
        let positionX = 0;
        let positionY = 0;

        let maxCount = 144;
        let counter = 0;

        for (let rowIt = 0; rowIt < MAX_WIDTH; ++rowIt) {
            let row = [];
            
            // calculate Y position
            let offsetY = (rowIt === (MAX_HEIGHT - 1) ? -0.5 : 0.5);
            positionY = offsetY + (rowIt * this.tileHeight);

            let leftToRight = false;
            // check order of row
            // if even, go left to right
            if (rowIt % 2 === 0) {
                leftToRight = true;
            } else {
                counter +=  11;
            }

            for (let colIt = 0; colIt < MAX_HEIGHT; ++colIt) {
                // calculate X position
                
                let offsetX = (colIt === (MAX_WIDTH-1) ? -0.5 : 0.5);
                positionX = offsetX + (colIt  * this.tileWidth);

                let tile = new Tile({
                    id: leftToRight ? maxCount - counter : maxCount - (counter - colIt),
                    width: this.tileWidth,
                    height: this.tileHeight,
                    color: COLOR_PALETTE[0],
                    positionX: positionX,
                    positionY: positionY,
                    context: this.context
                });
                
                row.push(tile);

                if (leftToRight) {
                    ++counter;
                }
            }

            if (!leftToRight) {
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

        this.context.strokeStyle = 'white';
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
    handleCollition(x, y, selectedColor, callback = null) {

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

        //next?
        if (callback) {
            callback();
        }

    }

    /**
     * Generate Code
     */
    generateCode() {
        let prefix = '!pb1d.';
        let out = '';

        for (let rowIdx = this.layout.length -1; rowIdx >= 0; --rowIdx) {
            
            let row = this.layout[rowIdx];

            // if even
            if ((rowIdx + 1) % 2 === 0) {
                // iterate from left to right
                for (let tileIdx = 0; tileIdx < row.length; ++tileIdx) {
                    let tile = row[tileIdx];
                    out += (tile.color.title === 'eraser' ? 'z' : tile.color.title);
                }

            } else {
                // if odd

                // iterate from right to left

                for (let tileIdx = row.length - 1; tileIdx >= 0; --tileIdx) {
                    let tile = row[tileIdx];
                    out += (tile.color.title === 'eraser' ? 'z' : tile.color.title);
                }

            }

        }

        return prefix + this.encodeRLE(out);
    }

    /**
     * Encode text to RLE
     * @param code 
     */
    encodeRLE(code) {

        let charCount = 1;
        let out = '';
        
        for(let i = 0; i < code.length; i++) {
            
            let nextChar = code[i + 1];
            let currChar = code[i];
            
            if(currChar == nextChar) {
                charCount++;

                if(i == code.length - 1) {
                    out += charCount + currChar;
                    break;
                }

            } else {
                out += charCount + currChar;
                currChar = nextChar;
                charCount = 1;
            }
        }

        return out;
    }

    /**
     * decodeRLE
     */
    decodeRLE(encoded) {

        let decodedOutput = [];

        let code =  encoded.split('.')[1];

        let pixelCount = 1;

        let currNumber = ''; 

        for(let i = 0; i < code.length; i++) {
            
            // if is a number
            if (!isNaN(parseInt(code[i]))) {
                // concatenate string number in currNumber
                currNumber += code[i];
            } else {
                // set a group of ordered pixels to a color
                currNumber = Number(currNumber);
                this.colorizePixels(code[i], pixelCount, currNumber);
                pixelCount += currNumber;
                currNumber = '';
            }
        }

    }

    /**
     * colorizePixels
     */
    colorizePixels(colorTitle, from, count) {

        // set limit
        let limit = (from - 1) + count;

        // Get color from color palette
        let color = COLOR_PALETTE.filter((color, index) => {
            return color.title === colorTitle;
        })[0];

        // if we didn't found the color by character, use transparent bg
        color = !color ? COLOR_PALETTE[0] : color; 

        this.layout.forEach((row, rowIdx) => {
            row.forEach((tile, colIdx) => {
                
                if (tile.id >= from && tile.id <= limit) {
                    tile.color = color;
                }

            });
        });

    }
}