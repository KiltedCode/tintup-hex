# tintup-hex

This repo is a hexagon based display wall view leveraging the [TINT API](http://developers.tintup.com/). It is an image only view on the feed API. The view creates a wall of hexagons to fill the available space. The hexagons will cycle being replaced with images from the feed. Hexagon images are clickable to be expanded to a featured view that displays the image in a larger size along with the full description from the social post. This feature view can also be configured to link to the original post.

## Dependencies

The following project requires npm. All other code dependencies will be installed with an `npm install`.

In order to run the code, you'll need an API key from [TINT](http://www.tintup.com/) as well as a feed created with the product.

## Building the Code

The code is built using [Webpack](https://webpack.github.io/). It is installed as a dev dependency and already configured. Building the JS bundle is simple. Just run `npm run build`. This will create `tintup-hex.bundle.js` as well as copy the assets folder containing `tintup-hex.css`. All output will be found in the `dist` folder.

## Running the Code

An example HTML file can be found at `example/index.html`. This should be placed with the rest of the content in the dist folder. The example is preconfigured with calls to be made and includes references to all files necessary. To run, the HTML needs to include a reference to the css and the js. 

Include the css with a reference in the head of the document 

```html
<link rel="stylesheet" href="/path-to-css/tintup-hex.css"/>
```

Include the JS with a script reference 

```html
<script src="/path-to-js/tintup-hex.bundle.js"></script>
```

Lastly, the page needs a HexWall object and a call to `initHexWall()` to start up visualization.

```javascript
var hexWall = new HexGenerator.HexWall({
    apiKey: 'API-KEY-GOES-HERE', 
    feedName: 'FEED-NAME'
});
hexWall.initHexWall();
```

### Configuration

When creating a HexWall object, the constructor takes a configuration object. The object requires an API key and a feed name. All other parameters are options.

| Parameter          | Type    | Default     | Description  |
| ------------------ | ------- |-------------| -----|
| `apiKey`           | string  | none        | API key for use with the TINT API. |
| `feedName`         | string  | none        | The name of the feed to display. |
| `allowInteraction` | boolean | `true`      | Can hexagons be interacted with? If false, they cannot be clicked to show feature view. |
| `allowLinking`     | boolean | `true`      | Should linking to original posts be allowed, in the feature view? Link will be opened in a new tab. |
| `bgColor`          | string  | `'#383838'` | The background color of the hexagon wall. |
| `fillAmount`       | number  | `.2`        | The amount of hexagons that should be filled with images concurrently. This is a decimal representation of a percentage. It should be greater than 0 and less than or equal to 1. |
| `hexSize`          | string  | `lg'`       | The size of the hexagons to be displayed on the screen. The valid options are `'sm'`, `'md'`, and `'lg'`. |
| `primaryColor`     | string  | `'#AA4839'` | The primary color to be used as a background color for a hexagon. This color and three variations of it will be used with most probablity. |
| `secondaryColor`   | string  | `'#AA7239'` | The secondary color to be used as a background color for a hexagon. This color and two variations of it will be used with second most probablity. |
| `tertiaryColor`    | string  | `'#8F305B'` | The third color to be used as a background color for a hexagon. This color and one variations of it will be used with the least probablity. |

## Implementation Notes

The current implementation is purely CSS based for the hexagons, with JQuery for the dynamic adding of tags needed to draw the hexagons. The goal of using CSS only for the drawing to be light weight. The script code is written in Typescript, with an ES5 target for compatibility purposes. 

### Future Implementation

The CSS only route has limitations. I makes it more susceptible to cross-browser issues and to side effects when embedding (though in limited testing it hasn't shown issues). It also ends up with some hexagons off screen to ensure fill of the visible screen at all sizes. 

A future impementation could be done with d3 / SVG to handle creating and manipulating the hexagons. This could provide more precise logic for filling the screen with hexagons with less overflow off the visible edges of screen. The main logic of how everything is managed and cycled could remain, as well as the steps and timeouts.