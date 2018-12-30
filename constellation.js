/*
	Constellation.js 
	A physics-based constellation-like animation in JavaScript.
	
    Copyright (C) 2018 Corey Shuman <ctshumancode@gmail.com>
	
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/ 

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

class Point {
	constructor(x, y) {
		if(!isNaN(x)) this.x = x;
		if(!isNaN(y)) this.y = y;
	}

	update(x, y) {
		this.x = x;
		this.y = y;
	}
}


	/* Individual point entity, contains location, movement, and drawing functions */
class ConstPoint {
	constructor(x, y, dx, dy, color, pointSize) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.pointSize = pointSize;
		this.dx = dx; 
		this.dy = dy; 
		this.neighbors = []; // array containing {point,distance} objects
	}
	
	update(allPoints, maxDistance, maxX, maxY) {
		this.updateLocation(maxX, maxY);
		this.updateNeighborList(allPoints, maxDistance);
	};
	
	draw (ctx, lineColor, lineWidth, maxLineLength) {
		this.drawPoint(ctx);
		this.drawLines(ctx, lineColor, lineWidth, maxLineLength);
	};
	
	drawPoint(ctx) {
		ctx.fillStyle = this.color;
		ctx.globalAlpha = 0.9;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.pointSize, 0, 2*Math.PI);
		ctx.fill();
	};
	
	drawLines(ctx, lineColor, lineWidth, maxLineLength) {
		var i = this.neighbors.length;
		const neighbors = this.neighbors;
		ctx.strokeStyle = lineColor;
		ctx.lineWidth = lineWidth;
		while(i--)
		{
			const pd = neighbors[i];
			ctx.globalAlpha = (maxLineLength - pd.distance) / maxLineLength;
			ctx.beginPath();
			ctx.moveTo(this.x, this.y);
			ctx.lineTo(pd.p.x, pd.p.y);
			ctx.stroke();
		}
	};
	
	updateLocation(maxX, maxY) {
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
		
		if(this.dx > 0.5) this.dx -= 0.03;
		if(this.dy > 0.5) this.dy -= 0.03;
		if(this.dx < -0.5) this.dx += 0.03;
		if(this.dy < -0.5) this.dy += 0.03;
	};
	
	updateNeighborList(allPoints, maxDistance) {
		var i;
		this.neighbors = [];
		for(i=0; i<allPoints.length; i++)
		{
			var p = allPoints[i];
			
			if(this === p) {
				continue;
			}
			
			const dist = this.getDistanceFromPoint(p);
			
			if(dist < maxDistance)
			{
				this.neighbors.push({p, distance: dist});
			}
		}
	};
	
	getDistanceFromPoint(p) {
		const x = p.x - this.x;
		const y = p.y - this.y;
		return Math.sqrt( x*x + y*y );
	};

	getAngleFromPoint(p) {
		return Math.atan2(this.y - p.y, this.x - p.x);
	}
};

class Constellation {
	constructor(userSettings) {
		this.this = this;
		this.lastPhysicsUpdateTime = 0;
		this.running = false;
		this.pointCount = 0;
		
		this.settings = {
			canvasDiv: 'canvas',
			canvasId: 'canvas',
			canvasWidth: -1,
			canvasHeight: -1,
			fpsDiv: '',
			showFps: false,
			pointDensity: 30,
			maxDx: 5,
			maxDy: 5,
			maxLineLength: 60,
			repelRange: [0, 20],
			repelForce: [.1, 0],
			attractRange: [15, 55],
			attractForce: [0, .001],
			maxCursorPushLength: 60,
			maxCursorPushStrength: .3,
			lineColor: 'lightblue',
			pointColor: 'teal',
			pointInteractColor: 'red',
			pointSize: 3,
			lineSize: 2,
			screenBlur: 0.6,
			backgroundColor: 'black'
		};
		
		if (userSettings) {
			for(var prop in userSettings) {
				if(this.settings.hasOwnProperty(prop)) {
					this.settings[prop] = userSettings[prop];
				}
			}
		}
		
		this.canvas = document.createElement('canvas');
		document.getElementById(this.settings.canvasDiv).appendChild(this.canvas);
		//this.canvas = document.getElementById(this.settings.canvasId);
		this.context = this.canvas.getContext('2d');
		this.points = [];
		this.canvasOffset = this.getOffset(this.canvas);
		// stores cursor position 
		this.cursor = new Point();
		// store touch positions on mobile
		this.touches = [];
	}
	
	initPoints(cnt) {
		this.points = [];
		const pointColor = this.settings.pointColor;
		const pointSize = this.settings.pointSize;
		do {
			this.points.push(new ConstPoint(
				this.getRandomInt(1,this.canvas.width-1), 
				this.getRandomInt(1,this.canvas.height-1), 
				Math.random() * this.getRandomInt(-1,1), 
				Math.random() * this.getRandomInt(-1,1), 
				pointColor, pointSize));
		} while (cnt--);
	};

	clearPointColor(p) {
		p.color = this.settings.pointColor;
	}
	
	updateCursorInfluence(p, pCursor) {
		const dist = p.getDistanceFromPoint(pCursor);
		const settings = this.settings;
		const maxCursorPushLength = settings.maxCursorPushLength;
		const maxCursorPushStrength = settings.maxCursorPushStrength;
		const maxDx = settings.maxDx;
		const maxDy = settings.maxDy;

		if(dist < maxCursorPushLength)
		{
			const pushForce = maxCursorPushStrength * ((maxCursorPushLength - dist) / maxCursorPushLength);
			const angle = p.getAngleFromPoint(pCursor);
			
			p.color = settings.pointInteractColor;
			p.dx += Math.cos(angle) * pushForce;
			p.dy += Math.sin(angle) * pushForce;

			if(p.dx < -maxDx) p.dx = - maxDx;
			if(p.dx > maxDx) p.dx = maxDx;
			if(p.dy < -maxDy) p.dy = - maxDy;
			if(p.dy > maxDy) p.dy = maxDy;
		}
	};
		
	updatePullFromNeighbors(point) {
		const neighbors = point.neighbors;
		const settings = this.settings;
		const repelRange = settings.repelRange;
		const repelForce = settings.repelForce;
		const attractRange = settings.attractRange;
		const attractForce = settings.attractForce;
		const maxDx = settings.maxDx;
		const maxDy = settings.maxDy;
		var i = neighbors.length;


		
		while(i--) {
			const p = point.neighbors[i].p;
			const p_x = p.x;
			const p_y = p.y;
			const point_x = point.x;
			const point_y = point.y;
			const point_dx = point.dx;
			const point_dy = point.dy;

			const dist = point.neighbors[i].distance;
			const angle = p.getAngleFromPoint(point);

			if(dist >= repelRange[0] && dist <= repelRange[1]) {
				const rForce = this.linearMap(dist, repelForce, repelRange);
				p.dx += Math.cos(angle) * rForce;
				p.dy += Math.sin(angle) * rForce;
			}

			if(dist >= attractRange[0] && dist <= attractRange[1]) {
				const aForce = this.linearMap(dist, attractForce, attractRange);
				p.dx -= Math.cos(angle) * aForce;
				p.dy -= Math.sin(angle) * aForce;
			}

			if(p.dx < -maxDx) p.dx = - maxDx;
			if(p.dx > maxDx) p.dx = maxDx;
			if(p.dy < -maxDy) p.dy = - maxDy;
			if(p.dy > maxDy) p.dy = maxDy;
		}
	};
	
	draw() {
		const ctx = this.context;
		const points = this.points;
		const lineColor = this.settings.lineColor;
		const lineWidth = this.settings.lineWidth;
		const maxLineLength = this.settings.maxLineLength;
		ctx.globalAlpha = 1 - this.settings.screenBlur;
		ctx.fillStyle = this.settings.backgroundColor;
		ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
		var i = this.points.length;
		
		while(i--) {
			var p = points[i];
			p.draw(ctx, lineColor, lineWidth, maxLineLength);
		} 
	};

	update(){
		var points = this.points;
		var maxLineLength = this.settings.maxLineLength;
		var maxX = this.canvas.width;
		var maxY = this.canvas.height;
		var i = points.length;
		while(i--) {
			var p = points[i];
			p.update(points, maxLineLength, maxX, maxY);
			this.updatePullFromNeighbors(p);
			this.clearPointColor(p);
			if(this.touches.length == 0) {
				this.updateCursorInfluence(p, this.cursor);
			} else {
				for(var j = 0; j < this.touches.length; j++) {
					this.updateCursorInfluence(p, this.touches[j]);
				}
			}
		}
	};
	
	
	init() {
		this.context.fillStyle = this.settings.backgroundColor;
		this.context.fillRect(0,0,this.canvas.width, this.canvas.height);
		this.canvas.width = (this.settings.canvasWidth === -1) ? window.innerWidth : this.settings.canvasWidth;
		this.canvas.height = (this.settings.canvasHeight === -1) ? window.innerHeight : this.settings.canvasHeight;
		this.initPoints(this.getPointCount());
		
		document.body.addEventListener( "mousemove", function( evt ) {
			this.cursor.update(evt.pageX-this.canvasOffset.left, evt.pageY-this.canvasOffset.top);
		}.bind(this));
		
		// add support for touch events
		document.body.addEventListener( "touchstart", function( evt ) {
			//evt.preventDefault();
			var ct = evt.changedTouches;
			for(var i = 0; i < ct.length; i++) {
				var touch = ct[i];
				this.touches.push({ identifier: touch.identifier, x: touch.pageX-this.canvasOffset.left, y: touch.pageY-this.canvasOffset.top });
			}
		}.bind(this));
		
		document.body.addEventListener( "touchmove", function( evt ) {
			evt.preventDefault();
			var ct = evt.changedTouches;
			for(var i = 0; i < ct.length; i++) {
				var idx = this.findTouchById(ct[i].identifier);
				var touch = ct[i];
				if(idx >= 0) {
					this.touches.splice(idx, 1, { identifier: touch.identifier, x: touch.pageX-this.canvasOffset.left, y: touch.pageY-this.canvasOffset.top });
				}
			}
		}.bind(this));
		
		document.body.addEventListener( "touchend", function( evt ) {
			evt.preventDefault();
			var ct = evt.changedTouches;
			for(var i = 0; i < ct.length; i++) {
				var idx = this.findTouchById(ct[i].identifier);
				if(idx >= 0) {
					this.touches.splice(idx, 1);
				}
			}
		}.bind(this));
		
		document.body.addEventListener( "touchcancel", function( evt ) {
			for(var i = 0; i < this.touches.length; i++) {
				this.touches.pop();
			}
		}.bind(this));

		// redraw screen and points on a screen resize
		window.addEventListener("resize", function(e) {
			this.canvas.width = (this.settings.canvasWidth === -1) ? window.innerWidth : this.settings.canvasWidth;
			this.canvas.height = (this.settings.canvasHeight === -1) ? window.innerHeight : this.settings.canvasHeight;
			this.initPoints(this.getPointCount());
		}.bind(this));
	};
	
	start() {
		this.running = true;
		this.run();
	};

	stop() {
		this.running = false;
	}
	
	run() {
		var currentTime = new Date().getTime();
		
		if(this.running) {
			requestAnimationFrame(this.run.bind(this));
		}
		//if(currentTime - this.lastPhysicsUpdateTime > 33) {
			this.update();
			//this.lastPhysicsUpdateTime = currentTime;
		//}
		this.draw();
		
		if(this.settings.showFps) {
			document.getElementById(this.settings.fpsDiv).innerHTML = fps.getFPS();
		}
	};

	// calculate point count based on density and screen size
	getPointCount() {
		return Math.max(Math.floor((this.canvas.width * this.canvas.height) / 100000 * this.settings.pointDensity), 10);
	}
	
	// function to match touch event with stored touch position
	findTouchById(idToFind) {
		for (var i = 0; i < this.touches.length; i++) {
			var id = this.touches[i].identifier;

			if (id == idToFind) {
			  return i;
			}
		}
		return -1;    // not found
	}

	// helper function to get element offset
	getOffset(el) {
		const rect = el.getBoundingClientRect();
		return {
			left: rect.left + window.scrollX,
			top: rect.top + window.scrollY
		};
	}

	// helper function to get a random integer between two values
	getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	// function to find the point on a line (y=mx+b)
	linearMap(value, yRange, xRange) {
		return (value - xRange[0]) * (yRange[1] - yRange[0]) / (xRange[1] - xRange[0]) + yRange[0];
	}
};
