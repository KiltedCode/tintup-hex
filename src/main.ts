import * as $ from 'jquery';

declare interface FeedItem {
    "url": string;
    "source": number;
    "created": number;
    "user_id": number;
    "visible": number;
    "comments": string;
    "social_feed_id": number;
    "social_post_id": string;
    "social_id": string;
    "phash": any;
    "height": number;
    "width": number;
    "original_image": string;
    "author": string;
    "embed": string;
    "image": string;
    "title": string;
    "timestamp": number;
    "original_timestamp": number;
    "tweet_post_id": string;
    "post_id": string;
    "user_rights": {},
    "nsfw_score": any;
    "language": "en",
    "likes_count": any;
    "shares_count": any;
    "replies_count": any;
    "description": any;
    "cta": string;
    "highlight": boolean
    "pinned": boolean
    "recur_frequency": string;
    "recur_offset": string;
    "geo": {
        "city": string;
        "region": string;
        "country": string;
        "country_code": string;
        "latitude": string;
        "longitude": string;
        "lat": string;
        "lng": string;
        "geo_enabled": false
    },
    "tags": string[],
    "popup_function": string;
    "tweet_urls": string[],
    "retweeted_by": string;
    "custom_field": any,
    "offset": number;
    "ref_timestamp": number;
    "unique_offset": number;
    "relative_offset": number;
}

export class HexWall {
    private apiKey: string;
    private feedName: string;
    private feedData: FeedItem[];
    private hexagons: number;
    private randomArray: number[];
    private rows: number;
    private showIndex: number;
    private wrapper: any;

    /**
     * Initialized hexagon wall.
     */
    initHexWall() : void {
        this.calcHexagons();
        this.drawHexagons();
        window.setTimeout(this.getFeed.bind(this), 4000);
        // this.getFeed();
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
        let hexEdge = 200 / Math.sqrt(3);
        hexEdge -= 10; /* subtract padding between hexagons */
        /* calc number of hexagons to fill */
        this.hexagons = Math.ceil(((width / hexEdge) / 3) * 2);

        /* calculate # rows needed */
        this.rows = Math.round(height / (200 * .75) );
    }

     /**
     * Sets API key for TINTUP.
     * @param apiKey the api key for authentication
     * @param feedName the name of feed for lookups
     */
    configureFeed(apiKey: string, feedName: string): void {
        this.apiKey = apiKey;
        this.feedName = feedName;
    }

    /**
     * Creates hexagon wall.
     * Adds rows and divs based on calculations.
     */
    drawHexagons(): void {
        this.wrapper.empty();
        let hex = 0;
        let hexCount = this.hexagons * this.rows;
        let wall = '<div class="tu-hex-wall">';
        for(let r = 0; r < this.rows; r++) {
            let row = '<div class="tu-hex-row">';
            for(let h = 0; h < this.hexagons; h++) {
                row += `<div id="hex-${hex}" class="tu-hex tu-hex--side"><div class="tu-hex-in1"><div id="hex-${hex}-in" class="tu-hex-in2"></div></div></div>`;
                hex++;
            }
            row += '</div>';
            wall += row;
        }
        wall += '</div>';
        this.wrapper.append(wall);
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

    fadeIn(num: number): void {
        $('#hex-'+num+'-in').addClass('hex-fade-in');
    }

    fadeOut(num: number): void {
        $('#hex-'+num+'-in').removeClass('hex-fade-in');
    }

    fadeOutSlow(num: number): void {
        $('#hex-'+num+'-in').removeClass('hex-fade-in--slow');
    }

    addImage(num: number, index: number): void {
        console.log(num +', '+index);
        let hexEle = $('#hex-'+num+'-in');
        hexEle.addClass('fade-out-in');
        let feedEle: FeedItem = this.feedData[index];
        hexEle.css('background-image', `url(${feedEle.image})`);
    }

    step1(num: number, index: number): void {
        this.fadeOut(num);
        window.setTimeout(this.step2.bind(this), 800, num, index);
    }

    step2(num: number, index: number): void {
        let hexEle = $('#hex-'+num+'-in');
        if(index > this.feedData.length) {
            index = index % this.feedData.length;
        }
        let feedEle: FeedItem = this.feedData[index];
        hexEle.css('background-image', `url(${feedEle.image})`);
        hexEle.addClass('hex-fade-in--slow');
        window.setTimeout(this.step3.bind(this), 15000, num, index);
    }

    step3(num: number, index: number): void {
        this.fadeOutSlow(num);
        window.setTimeout(this.step4.bind(this), 800, num, index);
    }

    step4(num: number, index: number): void {
        let hexEle = $('#hex-'+num+'-in');
        hexEle.css('background-image', '');
        hexEle.addClass('hex-fade-in');
        window.setTimeout(this.cycle.bind(this), 800);
    }

    cycle(): void {
        this.step1(this.randomArray[this.showIndex], this.showIndex);
        // window.setTimeout(this.step1.bind(this), 2000 * this.showIndex, this.randomArray[this.showIndex], this.showIndex);
        this.showIndex = (this.showIndex + 1) % (this.hexagons * this.rows);
        console.log(this.showIndex);
    }

    startImages(): void {
        this.showIndex = 0;
        this.randomArray.sort(function() { return 0.5 - Math.random(); });

        let hexCount = this.hexagons * this.rows;
        let feedCount = this.feedData.length;
        let active = Math.ceil(hexCount * .2);
        console.log('active', active);
        let i = 0;
        while(this.showIndex < active) {
            window.setTimeout(this.step1.bind(this), 2000 * this.showIndex, this.randomArray[this.showIndex], this.showIndex);
            this.showIndex++;
        }
    }

    getFeed(): void {
        if(this.apiKey && this.feedName) {
            let url = `https://api.tintup.com/v1/feed/${this.feedName}?api_token=${this.apiKey}&count=30&select=image_only`;
            $.ajax({
                url: url,
                jsonp: 'callback',
                dataType: 'jsonp',
                success: (response) => {
                    if(response.error) {
                        console.log(response.error);
                    } else {
                        this.feedData = response.data;
                        let hexCount = this.hexagons * this.rows;
                        let feedCount = this.feedData.length;
                        this.startImages();
                        // TODO: Next page logic
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
}
