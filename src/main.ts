import * as $ from 'jquery';

export class HexWall {
    private wrapper: any;
    private hexagons: number;
    private rows: number;

    constructor() {

    }

    /**
     * Initialized hexagon wall.
     * Adds hexagons to dom to fill wall.
     */
    initHexWall() : void {
        this.calcHexagons();
        this.drawHexagons();
    }

    calcHexagons(): void {
        /* get wrapper to determine size */
        this.wrapper = $('.tu-hex-wall-wrapper');
        
        /* calculate # rows and # hexagons needed */
        let height : number = this.wrapper.height();
        let width: number = this.wrapper.width();
        
        /* calculate # hexagons needed */
        /* calc length of side of hexagon */
        let hexEdge = 200 / Math.sqrt(3);
        hexEdge -= 10;
        /* calc number of hexagons to fill */
        this.hexagons = Math.ceil(((width / hexEdge) / 3) * 2);
        console.log('hexes', this.hexagons);

        /* calculate # rows needed */
        this.rows = Math.round(height / (200 * .75) );
        console.log('rows', this.rows);
    }

    drawHexagons(): void {
        this.wrapper.empty();
        let wall = '<div class="tu-hex-wall">';
        let hex = 0;
        for(let r = 0; r < this.rows; r++) {
            let row = '<div class="tu-hex-row">';
            for(let h = 0; h < this.hexagons; h++) {
                row += '<div id="hex-' + hex + '" class="tu-hex tu-hex--side"><div class="tu-hex-in1"><div class="tu-hex-in2"></div></div></div>';
                hex++;
            }
            row += '</div>';
            wall += row;
        }
        wall += '</div>';
        this.wrapper.append(wall);

    }
}

let hexWall: HexWall = new HexWall();
hexWall.initHexWall();