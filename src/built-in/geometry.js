/**
 *          Geometry
 * ___________________________
 * ---------------------------
 *
 */

function XY(x, y)
{
	if(typeof x === 'object'){
		if(x.hasOwnProperty('y')){
			y = x.y;
		}
		if(x.hasOwnProperty('x')){
			x = x.x;
		}
	}

	this.x = x === undefined ? 0 : x;
	this.y = y === undefined ? 0 : y;
}

XY.prototype.add = function(x, y)
{
	if(typeof x === 'object'){
		if(x.hasOwnProperty('y')){
			y = x.y;
		}
		x = x.x;
	}
	this.x += x;
	this.y += y;
	return this;
};

XY.prototype.subtract = function(x, y)
{
	if(typeof x === 'object'){
		if(x.hasOwnProperty('y')){
			y = x.y;
		}
		x = x.x;
	}
	this.x -= x;
	this.y -= y;
	return this;
};

XY.prototype.multiply = function(x, y)
{
	if(typeof x === 'object'){
		if(x.hasOwnProperty('y')){
			y = x.y;
		}
		if(x.hasOwnProperty('x')){
			x = x.x;
		}
	}else if(y === undefined){
		y = x;
	}
	this.x *= x;
	this.y *= y;
	return this;
};


XY.prototype.divide = function(x, y)
{
	if(typeof x === 'object'){
		if(x.hasOwnProperty('y')){
			y = x.y;
		}
		if(x.hasOwnProperty('x')){
			x = x.x;
		}
	}else if(y === undefined){
		y = x;
	}
	this.x /= x;
	this.y /= y;
	return this;
};




/**
 * Simple point coordinates.
 * @param x
 * @param y
 * @constructor
 */
function Point(x, y)
{
	XY.call(this, x, y);
}

Point.prototype = Object.create(XY.prototype);
Point.prototype.constructor = Point;
Point.prototype.inRect = function(r){
		return this.x >= r.x && this.x <= r.x + r.w && this.y >= r.y && this.y <= r.y + r.h;
};
_uibuilder.Point = Point;


/**
 * Rectangle.
 * @param x
 * @param y
 * @param w
 * @param h
 * @constructor
 */
function Rect(x, y, w, h){
	Point.call(this, x, y);
	if(typeof x === 'object'){
		if(x.hasOwnProperty('w')) w = x.w;
		if(x.hasOwnProperty('h')) h = x.h;
	}

	this.w = w === undefined ? 0 : w;
	this.h = h === undefined ? 0 : h;
}
Rect.prototype = Object.create(Point.prototype);
Rect.prototype.constructor = Rect;
Rect.prototype.multiply = function(rect)
{
	this.x *= rect.x;
	this.y *= rect.y;
	this.w *= rect.w;
	this.h *= rect.h;
	return this;
};

/**
 * Fits Rect inside another Rect.
 * @param rect {Rect}
 */
Rect.prototype.fit = function(rect)
{
	var k1 = this.w/this.h;
	var k2 = rect.w/rect.h;
	if(k1 >= k2){
		this.h *= rect.w/this.w;
		this.w = rect.w;
	}else{
		this.w *= rect.h/this.h;
		this.h = rect.h;
	}
	return this;
};

Rect.prototype.copyValuesFrom = function(rect)
{
	this.x = rect.x;
	this.y = rect.y;
	this.w = rect.w;
	this.h = rect.h;
};
_uibuilder.Rect = Rect;


/**
 * Vector.
 * @param x
 * @param y
 * @constructor
 */
function Vector(x, y)
{
	Point.call(this, x, y);
}
Vector.prototype = Object.create(Point.prototype);
Vector.prototype.constructor = Vector;
Vector.prototype.normalize = function()
{
	var len = Math.sqrt((this.x * this.x) + (this.y * this.y));
	this.x = x/len;
	this.y = y/len;
	return this;
};
_uibuilder.Vector = Vector;