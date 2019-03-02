// This is the main file, grid entry point.
const COLOR_PALETTE = [
    { color: 'transparent', title: 'eraser' },
    { color: 'gray', title: 'x' },
    { color: 'white', title: 'w' },
    { color: 'maroon', title: 'm' },
    { color: 'red', title: 'r' },
    { color: 'orangered', title: 'or' },
    { color: 'darkorange', title: 'do' },
    { color: 'orange', title: 'or' },
    { color: 'khaki', title: 'k' },
    { color: 'yellow', title: 'y' },
    { color: 'gold', title: 'go' },
    { color: '#B8860B', title: 'gr' },
    { color: 'darkgreen', title: 'dg' },
    { color: 'green', title: 'g' },
    { color: 'teal', title: 'te' },
    { color: 'cyan', title: 'cy' },
    { color: 'blue', title: 'b' },
    { color: 'navy', title: 'n' },
    { color: 'purple', title: 'p' },
    { color: '#6441a5', title: 'tp' },
    { color: 'pink', title: 'pi' }
];

class PBotCanvas {

    constructor() {
        this.element = document.getElementById('PBotCanvas');
        this.context = this.element.getContext('2d');
        this.grid = new Grid(this.context);
        this.currentColor = COLOR_PALETTE[1];
        this.pointer = new Tile({
            id: null,
            width: 40,
            height: 40,
            color: this.currentColor,
            positionX: null,
            positionY: null,
            context: this.context
        });
        this.isDragging = false;
    }

    init() {
        
        this.drawPalette();
        this.subscribeToEvents();
        this.update()
    }

    /**
     * Subscribe to events
     */
    subscribeToEvents() {
        // subscribe to canvas events if needed

        // mousemove
        this.element.addEventListener('mousemove', (e) => {
            this.pointer.positionX = e.clientX - this.element.offsetLeft - (this.pointer.width / 2);
            this.pointer.positionY = e.clientY - this.element.offsetTop - (this.pointer.height / 2);
            
            if (this.isDragging) {
                let x = e.clientX - this.element.offsetLeft;
                let y = e.clientY - this.element.offsetTop;
                
                this.grid.handleMouseDown(x, y, this.currentColor);
            }

            this.update()
        });

        // mousedown
        this.element.addEventListener('mousedown', (e) => {
            this.isDragging = true;

            let x = e.clientX - this.element.offsetLeft;
            let y = e.clientY - this.element.offsetTop;

            this.grid.handleMouseDown(x, y, this.currentColor);
        });

        // mouseup
        window.addEventListener('mouseup', (e) => {
            this.isDragging = false;
        });

        // Select Color
        let self = this; // save scope for jquery function
        $('.pen').click(function (e) {

            let element = $(this);
            let type;

            if (element.hasClass('eraser')) {
                self.currentColor = COLOR_PALETTE[0];
                type = 'eraser';
            } else {

                let i = element.attr('data-index');
                self.currentColor = COLOR_PALETTE[i];
                type = 'color';
            }

            self.pointer.color = self.currentColor;
            self.pointer.type = type;
        });


        // Generate Code
        document.getElementById('code-btn').onclick = (e) => {
            let code = this.grid.generateCode();
            document.getElementById('demo').innerHTML = code.first;
            document.getElementById('demo2').innerHTML = code.second;
        };

        
    }

    /**
     * Update
     * @description: This method is like a game loop, is in charge of drawing every frame.
     */
    update() {
        this.context.clearRect(0, 0, this.element.width, this.element.height);
        this.grid.draw();
        this.pointer.draw();
    }

    /**
     * Draw Palette
     */
    drawPalette() {
        
        for(let i = 0; i < COLOR_PALETTE.length; ++i) {
            if (COLOR_PALETTE[i].title === 'eraser') {
                $('#palette').append('<div data-index="' + i + '" class="pen eraser"> <i class="fas fa-eraser"></i> </div>')
            } else {
                $('#palette').append('<div data-index="' + i + '" class="pen" style="background-color:' + COLOR_PALETTE[i].color + ';"></div>')
            }
        }
    }
    
}

window.onload = function () { (new PBotCanvas).init(); };