# Constellation

![Constellation Banner Image](/docs/images/banner.gif)

A configurable physics-based animation in JavaScript which can produce many designs and effects, including constellation-like star fields. You can interact with the animation using the mouse or multiple touch points on touch devices.

View a demo here: https://coreyshuman.github.io/Constellation/demo

![Demo Collage](/docs/images/collage.png)

# Example Usage:

```html
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * {
        margin: 0;
        padding: 0;
      }
      html,
      body {
        width: 100%;
        height: 100%;
      }
      canvas {
        display: block;
      }

      #fps {
        position: fixed;
        top: 10;
        left: 10;
        width: 50;
        height: 20;
        color: white;
      }
    </style>
  </head>
  <body>
    <div id="canvasdiv">
      <div id="fps"></div>
    </div>
    <script src="constellation.js"></script>
    <script type="text/javascript">
      $(function () {
        var constellation = new Constellation({
          targetDiv: "canvasdiv",
        });
        constellation.init();
        constellation.start();
      });
    </script>
  </body>
</html>
```
