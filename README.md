# Constellation

![Constellation Banner Image](/docs/images/banner.gif)

A configurable physics-based animation in JavaScript which can produce many designs and effects, including constellation-like star fields. You can interact with the animation using the mouse or multiple touch points on touch devices.

View a demo here: https://coreyshuman.github.io/Constellation/demo

![Demo Collage](/docs/images/collage.png)

# Example Usage:

```html
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * {
        margin: 0;
        padding: 0;
      }
      #canvasdiv {
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="canvasdiv"></div>
    <script src="constellation.js"></script>
    <script type="text/javascript">
      (function () {
        var constellation = new Constellation({
          canvasContainer: "canvasdiv",
        });
        constellation.init();
        constellation.start();
      })();
    </script>
  </body>
</html>
```
