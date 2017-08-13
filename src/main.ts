import * as $ from 'jquery';

import { FeedItem } from './ts/feed-item.model';
import { HexConfig } from './ts/hex-config.model';

export class HexWall {
    private allowLinking: boolean;
    private apiKey: string;
    private bgColor: string;
    private colors: string[];
    private feedName: string;
    private feedData: FeedItem[];
    private fillAmount: number;
    private hexagons: number;
    private hexSize: string;
    private morePages: boolean;
    private pageUrl: string;
    private primaryColor: string;
    private randomArray: number[];
    private rows: number;
    private secondaryColor: string;
    private showHexIndex: number;
    private showImageIndex: number;
    private tertiaryColor: string;
    private wrapper: any;

    /**
     * Constructor for HexWall.
     * @param config configuration object for settings.
     */
    constructor(config: HexConfig) {
        /* set values from config, with defaults */
        this.allowLinking = config.allowLinking != null ? config.allowLinking : true;
        this.apiKey = config.apiKey;
        this.feedName = config.feedName;
        this.fillAmount = config.fillAmount || .2;
        if(this.fillAmount > 1) {
            this.fillAmount = 1;
        }
        this.hexSize = config.hexSize || 'lg';
        this.bgColor = config.bgColor || '#383838';
        this.primaryColor = config.primaryColor || '#AA4839';
        this.secondaryColor = config.secondaryColor || '#AA7239';
        this.tertiaryColor = config.tertiaryColor || '#8F305B';

        /* set nonconfigurable base values */
        this.morePages = false;
        this.pageUrl = '';

        /* sets up colors for hexagons
            constructs so primary has highest probability */
        this.colors = [
            this.primaryColor, 
            this.primaryColor,  
            this.primaryColor,
            this.brightenColor(this.primaryColor, .15),
            this.brightenColor(this.primaryColor, -.15), 
            this.brightenColor(this.primaryColor, -.25), 
            this.secondaryColor, 
            this.secondaryColor, 
            this.brightenColor(this.secondaryColor, .15),
            this.brightenColor(this.secondaryColor, -.2), 
            this.tertiaryColor,
            this.brightenColor(this.tertiaryColor, -.2)
        ];
    }

    /**
     * Helper function to brighten hex color.
     * Negative lum will darken image.
     * @param hex hexadecimal representation of a color to be adjusted.
     * @param lum luminosity to change the color by
     */
    brightenColor(hex: string, lum: number) {
        /* validate hex */
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if(hex.length < 6) {
          hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;
      
        /* convert to decimal and change */
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
          c = parseInt(hex.substr(i*2,2), 16);
          c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
          rgb += ("00"+c).substr(c.length);
        }
      
        return rgb;
      }

    /**
     * Calculates numbers of hexagons and rows needed.
     */
    calcHexagons(): void {
        /* get wrapper to determine size */
        this.wrapper = $('.tu-hex-wall-wrapper');
        
        /* calculate # rows and # hexagons needed */
        let height : number = this.wrapper.height();
        let width: number = this.wrapper.width();
        
        /* calculate # hexagons needed */
        /* calc length of side of hexagon */
        let size = 200;
        if(this.hexSize == 'md') {
            size = 100;
        } else if(this.hexSize == 'sm') {
            size = 50;
        }
        let hexEdge = size / Math.sqrt(3);
        hexEdge -= 10; /* subtract padding between hexagons */
        /* calc number of hexagons to fill */
        this.hexagons = Math.ceil(((width / hexEdge) / 3) * 2);

        /* calculate # rows needed */
        this.rows = Math.round(height / (size * .75) );
    }

    /**
     * Function to cycle through images.
     * Starts steps to show image, updates indicies.
     */
    cycle(): void {
        this.step1(this.randomArray[this.showHexIndex], this.showImageIndex);
        this.showHexIndex = (this.showHexIndex + 1) % (this.hexagons * this.rows);
        this.showImageIndex = (this.showImageIndex + 1) % this.feedData.length;
        /* if nearing feed size, get another page */
        if(this.morePages && (this.feedData.length - this.showImageIndex < 5)) {
            this.getFeedPage();
        }
    }

    /**
     * Creates hexagon wall.
     * Adds rows and divs based on calculations.
     */
    drawHexagons(): void {
        this.wrapper.empty();
        let hex = 0;
        let hexCount = this.hexagons * this.rows;
        let wall = `<div class="tu-hex-wall" style="background-color: ${this.bgColor}"><div class="tu-hex-feature--wrapper"><div class="tu-hex-feature--content"><div class="tu-hex-feature--close">x</div><img class="tu-hex-feature-img" /><div class="tu-hex-feature--desc"></div></div></div>`;
        for(let r = 0; r < this.rows; r++) {
            let row = '<div class="tu-hex-row">';
            for(let h = 0; h < this.hexagons; h++) {
                let colorIndex = this.getRandomInt(0, this.colors.length);
                row += `<div id="hex-${hex}" class="tu-hex tu-hex--side hex--${this.hexSize}"><div class="tu-hex-in1"><div id="hex-${hex}-in" class="tu-hex-in2" style="background-color:${this.colors[colorIndex]}"><div class="hex-name"></div></div></div></div>`;
                hex++;
            }
            row += '</div>';
            wall += row;
        }
        wall += '</div>';
        this.wrapper.append(wall);
        $('.tu-hex-feature--close').click(function(){ 
            let wrapperEle = $('.tu-hex-feature--wrapper');
            wrapperEle.css('display', 'none');
            wrapperEle.find('img').off('click');
        });
        this.randomArray = [];
        this.randomArray.length = hexCount;
        for(let i = 0; i < hexCount; i++) {
            this.randomArray[i] = i;
        }
        this.randomArray.sort(function() { return 0.5 - Math.random(); });
        this.randomArray.forEach((num, index) => {
            window.setTimeout(this.fadeIn, 30 * index, num);
        });
    }

    /**
     * Helper function to fade in hexagon.
     * Adds the hex-fade-in class.
     * @param num number of hexagon used to select from dom.
     */
    fadeIn(num: number): void {
        $('#hex-'+num+'-in').addClass('hex-fade-in');
    }
    
    /**
     * Used to show featured post.
     * @param event object containing feed index and reference to this.
     */
    featureHex(event: any): void {
        let featureEle = $('.tu-hex-feature--wrapper');
        let feedEle: FeedItem = event.data.that.feedData[event.data.feedEle];
        let imgEle = featureEle.find('img').attr('src', feedEle.original_image).attr('alt', 'Social Image');
        console.log('linking', event.data.that.allowLinking);
        if(event.data.that.allowLinking) {
            let url = feedEle.url;
            if(url && url != '') {
                console.log('url');
                imgEle.click(function() { window.open(url, '_blank'); });
                imgEle.addClass('clickable').attr('title', 'Click for original post');
            } else {
                console.log('nothing');
                imgEle.removeClass('clickable').attr('title', null);
            }
        }
        featureEle.find('.tu-hex-feature--desc').text(feedEle.title);
        featureEle.css('display', 'flex');
    }

    /**
     * Gets feed data from TINTUP API.
     * Requires api key and feed name to be set.
     */
    getFeed(): void {
        if(this.apiKey && this.feedName) {
            let active = Math.ceil(this.hexagons * this.rows * this.fillAmount);
            let count = active > 30 ? active : 30;
            let url = `https://api.tintup.com/v1/feed/${this.feedName}?api_token=${this.apiKey}&count=${count}&select=image_only`;
            $.ajax({
                url: url,
                jsonp: 'callback',
                dataType: 'jsonp',
                success: (response) => {
                    if(response.error) {
                        console.log(response.error);
                    } else {
                        this.feedData = response.data;
                        this.morePages = response.has_next_page;
                        this.pageUrl = response.next_page;
                        this.startImages();

                        let hexCount = this.hexagons * this.rows;
                        let feedCount = this.feedData.length;
                        if(this.morePages && feedCount < hexCount) {
                            this.getFeedPage();
                        }
                    }
                },
                error: function(error) {
                    console.log('error', error);
                }
            });

        } else {
            // TODO: error message
        }
    }

    getFeedPage(): void {
        $.ajax({
            url: this.pageUrl,
            jsonp: 'callback',
            dataType: 'jsonp',
            success: (response) => {
                if(response.error) {
                    console.log(response.error);
                } else {
                    this.feedData.push(...response.data);
                    this.morePages = response.has_next_page;
                    this.pageUrl = response.next_page;

                    let hexCount = this.hexagons * this.rows;
                    let feedCount = this.feedData.length;
                    if(this.morePages && feedCount < hexCount) {
                        this.getFeedPage();
                    }
                }
            },
            error: function(error) {
                console.log('error', error);
            }
        });
    }

    /**
     * Helper function to get random integer.
     * Based on MDN snippet.
     * @param min minimum value, inclusive.
     * @param max maximum value, exclusive.
     * @return {number} random integer.
     */
    getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Initialized hexagon wall.
     */
    initHexWall() : void {
        this.calcHexagons();
        this.drawHexagons();
        window.setTimeout(this.getFeed.bind(this), 4000);
    }

    /**
     * Shows initial images.
     * Will fill percentage of hexagon based on fillAmount variable.
     * Sets timeout for step 1 for all hexagons.
     */
    startImages(): void {
        this.showHexIndex = 0;
        this.showImageIndex = 0;
        this.randomArray.sort(function() { return 0.5 - Math.random(); });

        let hexCount = this.hexagons * this.rows;
        let feedCount = this.feedData.length;
        let active = Math.ceil(hexCount * this.fillAmount);
        let i = 0;
        let initialTimeout = 2000;
        if(active > 36) {
            initialTimeout = 125;
        } else if(active > 27) {
            initialTimeout = 250;
        } else if(active > 18) {
            initialTimeout = 500;
        }else if(active > 9) {
            initialTimeout = 1000;
        }
        while(this.showHexIndex < active) {
            if(this.showHexIndex > this.feedData.length) {
                break;
            }
            window.setTimeout(this.step1.bind(this), initialTimeout * this.showHexIndex, this.randomArray[this.showHexIndex], this.showImageIndex);
            this.showHexIndex++;
            this.showImageIndex++;
        }
    }

    /**
     * Step 1 for image cycle.
     * Fades out hexagon.
     * Sets timeout for step 2.
     * @param num number of hexagon used to select from dom.
     * @param index index for image.
     */
    step1(num: number, index: number): void {
        $('#hex-'+num+'-in').removeClass('hex-fade-in');
        window.setTimeout(this.step2.bind(this), 800, num, index);
    }

    /**
     * Step 2 for image cycle.
     * Selects image from feed and adds to background.
     * Fades in hexagon slowly.
     * Sets timeout for step 3.
     * @param num number of hexagon used to select from dom.
     * @param index index for image.
     */
    step2(num: number, index: number): void {
        let hexEle = $('#hex-'+num+'-in');
        let nameEle = $('#hex-'+num+'-in .hex-name');
        let feedEle: FeedItem = this.feedData[index];
        let author: any = JSON.parse(feedEle.author);
        hexEle.css('background-image', `url(${feedEle.image})`);
        hexEle.attr('data-content-id', index);
        hexEle.click({ feedEle: index, that: this }, this.featureHex);
        if(author) {
            if(author.username) {
                nameEle.text(`@${author.username}`);
            } else if(author.name) {
                nameEle.text(author.name);
            }
            
        }
        hexEle.addClass('hex-fade-in--slow clickable');
        window.setTimeout(this.step3.bind(this), 15000, num, index);
    }

    /**
     * Step 3 for image cycle.
     * Fades out hexagon.
     * Sets timeout for step 4.
     * @param num number of hexagon used to select from dom.
     * @param index index for image.
     */
    step3(num: number, index: number): void {
        $('#hex-'+num+'-in').removeClass('hex-fade-in--slow clickable');
        window.setTimeout(this.step4.bind(this), 800, num, index);
    }

    /**
     * Step 4 for image cycle.
     * Removes image from background.
     * Fades in hexagon.
     * Sets timeout to start cycle for new image.
     * @param num number of hexagon used to select from dom.
     * @param index index for image.
     */
    step4(num: number, index: number): void {
        let hexEle = $('#hex-'+num+'-in');
        let nameEle = $('#hex-'+num+'-in .hex-name');
        hexEle.css('background-image', '');
        hexEle.off('click');
        hexEle.addClass('hex-fade-in');
        nameEle.text('');
        window.setTimeout(this.cycle.bind(this), 800);
    }
}
