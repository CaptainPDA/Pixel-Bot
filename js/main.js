// This is the main file, grid entry point.
const COLOR_PALETTE = [
    { color: 'transparent', title: 'eraser' },
    { color: '#ff0000', title: 'a' },
    { color: '#008000', title: 'b' },
    { color: '#0000ff', title: 'c' },
    { color: '#ffffff', title: 'd' },
    { color: '#000000', title: 'e' },
    { color: '#FFFF00', title: 'f' },
    { color: '#800000', title: 'g' },
    { color: '#800080', title: 'h' },
    { color: '#6441a5', title: 'i' },
    { color: '#000080', title: 'j' },
    { color: '#006400', title: 'k' },
    { color: '#ffd700', title: 'l' },
    { color: '#f0e68c', title: 'm' },
    { color: '#daa520', title: 'n' },
    { color: '#00ffff', title: 'o' },
    { color: '#008080', title: 'p' },
    { color: '#00ced1', title: 'q' },
    { color: '#ffa500', title: 'r' },
    { color: '#ff8c00', title: 's' },
    { color: '#ff4500', title: 't' },
    { color: '#ffc0cb', title: 'u' },
    { color: '#ff1493', title: 'v' },
    { color: '#ffa07a', title: 'w' }
];



class PBotCanvas {

    constructor() {
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.element = document.getElementById('PBotCanvas');

        let elementWidth = $('.grid').outerWidth();
        let gridWidth = elementWidth > 480 ?  480 : elementWidth;

        // check for mobile
        if (this.isMobile) {
            gridWidth = elementWidth; 
        }

        this.element.width = gridWidth;
        this.element.height = gridWidth;

        this.context = this.element.getContext('2d');
        this.grid = new Grid(this.context);
        this.currentColor = COLOR_PALETTE[1];
        this.pointer = new Tile({
            id: null,
            width: this.element.width / MAX_WIDTH,
            height: this.element.height / MAX_HEIGHT,
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
        this.update();
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

        // touchmove
        this.element.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.pointer.positionX = e.touches[0].clientX - this.element.offsetLeft - (this.pointer.width / 2);
            this.pointer.positionY = e.touches[0].lientY - this.element.offsetTop - (this.pointer.height / 2);
            
            if (this.isDragging) {
                let x = e.touches[0].clientX - this.element.offsetLeft;
                let y = e.touches[0].clientY - this.element.offsetTop;
                
                this.grid.handleMouseDown(x, y, this.currentColor);
            }

            this.update();
        });

        // mousedown
        this.element.addEventListener('mousedown', (e) => {
            this.isDragging = true;

            let x = e.clientX - this.element.offsetLeft;
            let y = e.clientY - this.element.offsetTop;

            this.grid.handleMouseDown(x, y, this.currentColor);
        });

        // touchstart
        this.element.addEventListener('touchstart', (e) => {
            this.isDragging = true;

            let x = e.touches[0].clientX.clientX - this.element.offsetLeft;
            let y = e.touches[0].clientY - this.element.offsetTop;

            this.grid.handleMouseDown(x, y, this.currentColor);
            this.update();
        }, false);

        // mouseup
        window.addEventListener('mouseup', (e) => {
            this.isDragging = false;
        });

        // tocuhup
        window.addEventListener('touchend', (e) => {
            this.isDragging = false;
            this.update();
        }, false);

        // Select Color
        let self = this; // save scope for jquery function
        $('.pen').click(function (e) {

            let element = $(this);
            let type;

            if (element.hasClass('eraser')) {
                self.currentColor = COLOR_PALETTE[0];
                type = 'eraser';
            } else if (element.hasClass('clear-all')) {
                self.grid.decodeRLE('!pb1d.144z');
                self.update();
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
            document.getElementById('demo').innerHTML = this.grid.generateCode();

            $('.copy-code').removeClass('hide');
            $('.copy-code').addClass('show');

            // hide copy load-code
            $('.load-code').removeClass('show');
            $('.load-code').addClass('hide');

            // show load code button
            $('#load-code-btn').removeClass('hide');
            $('#load-code-btn').addClass('show');
        };


        // Load Code
        document.getElementById('load-code-btn').onclick = (e) => {            
            // show code input
            $('.load-code').removeClass('hide');
            $('.load-code').addClass('show');

            // hide button
            $('#load-code-btn').removeClass('show');
            $('#load-code-btn').addClass('hide');
            
            // hide copy inpuy
            $('.copy-code').removeClass('show');
            $('.copy-code').addClass('hide');
        };

        // Decode Button
        document.getElementById('decode-btn').onclick = (e) => {
            this.grid.decodeRLE(document.getElementById('decode-command').innerHTML);
            this.update();
            
            // show code input
            $('.load-code').removeClass('hide');
            $('.load-code').addClass('show');

            // hide button
            $('#load-code-btn').removeClass('show');
            $('#load-code-btn').addClass('hide');
            
            // hide copy input
            $('.code').removeClass('show');
            $('.copy-code').addClass('hide');
        };

        
    }

    /**
     * Update
     * @description: This method is like a game loop, is in charge of drawing every frame.
     */
    update() {
        this.context.clearRect(0, 0, this.element.width, this.element.height);
        this.grid.draw();
        
        if (!this.isMobile) {
            this.pointer.draw();
        }
    }

    /**
     * Draw Palette
     */
    drawPalette() {
        
        for(let i = 0; i < COLOR_PALETTE.length; ++i) {
            if (COLOR_PALETTE[i].title === 'eraser') {
                $('.color-list').append('<li data-index="' + i + '" class="pen eraser"> <i class="fas fa-eraser"></i> </li>');
            } else {
                $('.color-list').append('<li data-index="' + i + '" class="pen" style="background-color:' + COLOR_PALETTE[i].color + ';"></li>');
            }
        }

        
        // Clear All
        $('.color-list').append('<li class="pen clear-all"> <i class="fas fa-trash-alt"></i> </li>');


    }
    
}

window.onload = function () { (new PBotCanvas).init(); };