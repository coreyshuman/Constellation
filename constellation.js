
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var fps = {
	startTime : 0,
	frameNumber : 0,
	getFPS : function(){
		this.frameNumber++;
		var d = new Date().getTime(),
			currentTime = ( d - this.startTime ) / 1000,
			result = Math.floor( ( this.frameNumber / currentTime ) );

		if( currentTime > 1 ){
			this.startTime = new Date().getTime();
			this.frameNumber = 0;
		}
		return result;

	}	
};

var Point = function() {
	this.x = 0;
	this.y = 0;
	
	this.update = function(x,y) {
		this.x = x;
		this.y = y;
	};
};


	/* Individual point entity, contains location, movement, and drawing functions */
var ConstPoint = function(x, y, color, pointSize) {
	this.x = x;
	this.y = y;
	this.color = color;
	this.pointSize = pointSize;
	this.dx = Math.random() * getRandomInt(-1,1);
	this.dy = Math.random() * getRandomInt(-1,1);
	this.neighbors = []; // array containing [point,distance] pairs
	
	this.update = function(allPoints, maxDistance, maxX, maxY) {
		this.updateLocation(maxX, maxY);
		this.updateNeighborList(allPoints, maxDistance);
	};
	
	this.draw = function(ctx, lineColor, maxLineLength) {
		this.drawPoint(ctx);
		this.drawLines(ctx, lineColor, maxLineLength);
	};
	
	this.drawPoint = function(ctx) {
		ctx.fillStyle = this.color;
		//ctx.fillRect(Math.floor(this.x), Math.floor(this.y), PointSize, PointSize)
		ctx.globalAlpha = 0.9;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.pointSize, 0, 2*Math.PI);
		ctx.fill();
	};
	
	this.drawLines = function(ctx, lineColor, maxLineLength) {
		var i = this.neighbors.length;
		var neighbors = this.neighbors;
		ctx.strokeStyle = lineColor;
		ctx.lineWidth = 2;
		while(i--)
		{
			var p = neighbors[i];
			ctx.globalAlpha = (maxLineLength - p[1]) / maxLineLength;
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(p[0].x, p[0].y);
			ctx.stroke();
		}
	};
	
	this.updateLocation = function(maxX, maxY) {
		this.x += this.dx;
		this.y += this.dy;
		
		if(this.y < 0) {
			this.y = 0;
			this.dy = -this.dy;
		}
		if(this.x < 0) {
			this.x = 0;
			this.dx = -this.dx;
		}
		if(this.y > maxY) {
			this.y = maxY;
			this.dy = -this.dy;
		}
		if(this.x > maxX) {
			this.x = maxX;
			this.dx = -this.dx;
		}
		
		if(this.dx > 0.5) this.dx -= 0.01;
		if(this.dy > 0.5) this.dy -= 0.01;
		if(this.dx < -0.5) this.dx += 0.01;
		if(this.dy < -0.5) this.dy += 0.01;
	};
	
	this.updateNeighborList= function(allPoints, maxDistance) {
		var i;
		this.neighbors = [];
		for(i=0; i<allPoints.length; i++)
		{
			var p = allPoints[i];
			
			if(this === p) {
				continue;
			}
			
			var dist = this.getDistanceFromPoint(p);
			
			if(dist < maxDistance)
			{
				this.neighbors.push([p,dist]);
			}
		}
	};
	
	
	
	this.getDistanceFromPoint = function(p) {
		var x = p.x, y = p.y;
		return Math.sqrt( (x-=this.x)*x + (y-=this.y)*y );
	};
};

var Constellation = function(userSettings) {
	var self = this;
	var lastPhysicsUpdateTime = 0;
	
	this.settings = {
		targetDiv: 'canvas',
		canvasId: 'canvas',
		fpsDiv: '',
		showFps: false,
		pointCount: 400,
		maxDx: 5,
		maxDy: 5,
		maxLineLength: 60,
		maxPushDist: 10,
		maxPushStrength: 1/8,
		minPullDist: 55,
		maxPullStrength: 1/16,
		maxCursorPushLength: 60,
		maxCursorPushStrength: 1/2,
		lineColor: 'lightblue',
		pointColor: 'teal',
		pointSize: 3,
		screenBlur: 0.6,
		backgroundColor: 'black'
	};
	
	if (userSettings) {
		$.extend(this.settings, userSettings);
	}
	
	this.canvas = document.createElement('canvas');
	document.getElementById(this.settings.targetDiv).appendChild(this.canvas);
	//this.canvas = document.getElementById(this.settings.canvasId);
	this.context = this.canvas.getContext('2d');
	this.points = [];
	this.canvasOffset = $('canvas').offset();
	this.pointCountDivisor = 1920*1080 / this.settings.pointCount;
	this.cursor = new Point();
	
	this.initPoints = function(cnt) {
		this.points = [];
		var pointColor = this.settings.pointColor;
		var pointSize = this.settings.pointSize;
		do {
			this.points.push(new ConstPoint(getRandomInt(1,this.canvas.width-1), getRandomInt(1,this.canvas.height-1), pointColor, pointSize));
		} while (cnt--);
	};

	this.updateCursorInfluence = function(p) {
		var dist = p.getDistanceFromPoint(this.cursor);
		var settings = this.settings;
		var maxCursorPushLength = settings.maxCursorPushLength;
		var maxCursorPushStrength = settings.maxCursorPushStrength;
		var maxDx = settings.maxDx;
		var maxDy = settings.maxDy;
		var p_x = p.x;
		var p_y = p.y;
		var cursor_y = this.cursor.y;
		var cursor_x = this.cursor.x;
		var p_dx = p.dx;
		var p_dy = p.dy;
		var denom = maxCursorPushLength / maxCursorPushStrength;
		
		if(dist < maxCursorPushLength)
		{
			p.color = 'red';

			if(p_x < cursor_x)
			{
				if(p_dx > -maxDx) p.dx -= (cursor_x - p_x) / denom;
			}
			else
			{
				if(p_dx < maxDx) p.dx += (p_x - cursor_x) / denom;
			}
			
			if(p_y < cursor_y)
			{
				if(p_dy > -maxDy) p.dy -= (cursor_y - p_y) / denom;
			}
			else
			{
				if(p_dy < maxDy) p.dy += (p_y - cursor_y) / denom;
			}
			
		}
		else
		{
			p.color = this.settings.pointColor;
		}
	};
		
	this.updatePullFromNeighbors = function(point) {
		var neighbors = point.neighbors;
		var settings = this.settings;
		var minPullDist = settings.minPullDist;
		var maxPushDist = settings.maxPushDist;
		var maxDx = settings.maxDx;
		var maxDy = settings.maxDy;
		var maxLineLength = settings.maxLineLength;
		var maxPullStrength = settings.maxPullStrength;
		var maxPushStrength = settings.maxPushStrength;
		var i = neighbors.length;
		var denom_pull = (maxLineLength - minPullDist) / maxPullStrength;
		var denom_push = maxPushDist / maxPushStrength;


		
		while( i--) {
			var p = point.neighbors[i][0];
			var p_x = p.x;
			var p_y = p.y;
			var point_x = point.x;
			var point_y = point.y;
			var point_dx = point.dx;
			var point_dy = point.dy;
			
			if(point_x < p_x) {
				if(p_x - point_x > minPullDist) {
					if(point_dx < maxDx) point.dx += (p_x - point_x - minPullDist) / denom_pull;
				}
				else if(p_x - point_x < maxPushDist) {
					if(point_dx > -maxDx) point.dx -= (maxPushDist - (p_x - point_x)) / denom_pull;
				}
			}
			else
			{
				if(point_x - p_x > minPullDist) {
					if(point_dx > -maxDx) point.dx -= (point_x - p_x - minPullDist) / denom_pull;
				}
				else if(point_x - p_x < maxPushDist) {
					if(point_dx < maxDx) point.dx += (maxPushDist - (point_x - p_x)) / denom_push;
				}
			}
			
			if(point_y < p_y) {
				if(p_y - point_y > minPullDist) {
					if(point_dy < maxDx) point.dy += (p_y - point_y - minPullDist) / denom_pull;
				}
				else if(p_y - point_y < maxPushDist) {
					if(point_dy > -maxDy) point.dy -= (maxPushDist - (p_y - point_y)) / denom_push;
				}
			}
			else
			{
				if(point_y - p_y > minPullDist) {
					if(point_dy > -maxDx) point.dy -= (point_y - p_y - minPullDist) / denom_pull;
				}
				else if(point_y - p_y < maxPushDist) {
					if(point_dy < maxDy) point.dy += (maxPushDist - (point_y - p_y)) / denom_push;
				}
			}
		}
	};
	
	this.draw = function() {
		var ctx = this.context;
		var points = this.points;
		var lineColor = this.settings.lineColor;
		var maxLineLength = this.settings.maxLineLength;
		ctx.globalAlpha = 1 - this.settings.screenBlur;
		ctx.fillStyle = 'black';
		ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
		var i = this.points.length;
		
		while(i--) {
			var p = points[i];
			p.draw(ctx, lineColor, maxLineLength);
		} 
	};

	this.update = function(){
		var points = this.points;
		var maxLineLength = this.settings.maxLineLength;
		var maxX = this.canvas.width;
		var maxY = this.canvas.height;
		var i = points.length;
		while(i--) {
			var p = points[i];
			p.update(points, maxLineLength, maxX, maxY);
			this.updatePullFromNeighbors(p);
			this.updateCursorInfluence(p);
		}
	};
	
	
	this.init = function() {
		this.context.fillStyle = 'black';
		this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
		self.canvas.width = $(window).innerWidth();
		self.canvas.height = $(window).innerHeight();
		self.initPoints(Math.floor(self.canvas.width * self.canvas.height / self.pointCountDivisor));
		
		$( document ).on( "mousemove", function( event ) {
			self.cursor.update(event.pageX-self.canvasOffset.left, event.pageY-self.canvasOffset.top);
		});

		$(window).bind("resize", function(e){
			self.canvas.width = $(window).innerWidth();
			self.canvas.height = $(window).innerHeight();
			self.initPoints(Math.floor(self.canvas.width * self.canvas.height / self.pointCountDivisor));
		});
	};
	
	this.start = function() {
		this.run();
	};
	
	this.run = function() {
		var currentTime = new Date().getTime();
		
		requestAnimationFrame(self.run);
		if(currentTime - lastPhysicsUpdateTime > 33) {
			self.update();
			lastPhysicsUpdateTime = currentTime;
		}
		self.draw();
		
		if(self.settings.showFps) {
			document.getElementById(self.settings.fpsDiv).innerHTML = fps.getFPS();
		}
	};
};
