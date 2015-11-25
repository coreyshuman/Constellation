# Constellation
A physics-based constellation-like animation in JavaScript
View it here: http://coreyshuman.com/projects/constellation/


# Example Usage:

```
<html>
	<head>
		<script src="https://code.jquery.com/jquery-2.1.3.min.js"></script>
		<script src="constellation.js"></script>
		<script type="text/javascript">
			$(function() {
				var constellation = new Constellation({targetDiv: 'canvasdiv', fpsDiv: 'fps', showFps: true});
				constellation.init();
				constellation.start();
			});
		</script>
		
		<style>
			* { margin:0; padding: 0;}
			html, body { width:100%; height: 100%;}
			canvas { display: block;}
			
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
	</body>
</html>
```
