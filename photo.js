'use strict';

// model representation of photos to load

function PhotoList() {
	this.list = []; // new Set();

	this.selection = new Set();
}

PhotoList.prototype.add = function(photo) {
	this.list.push(photo);
	this.save();
}

PhotoList.prototype.remove = function(photo) {
	var i = this.list.indexOf(photo);
	this.list.splice(i, 1);
	this.save();
}

PhotoList.prototype.count = function() {
	return this.list.length;
}

PhotoList.prototype.filenames = function() {
	return this.list.map( p => p.filename );
}

PhotoList.prototype.items = function() {
	return Array.from(this.list);
}

PhotoList.prototype.toJSON = function() {
	this.list.map( p => { return {
		filename: p.filename,
		style: p.style
	}} )
}

PhotoList.prototype.save = function() {
	localStorage.lastLoad = JSON.stringify(this.filenames());
	// localStorage.lastLoad = JSON.stringify(this.toJSON());
}

PhotoList.prototype.load = function() {
	// TODO
	var lastLoad = localStorage.lastLoad;
	if (lastLoad) {
		var list = JSON.parse(lastLoad);
		list.forEach( json => {
			this.list.push(
				new Photo()
			)
		} );
	}
}

PhotoList.prototype.empty = function() {
	this.list = [];
	this.save();
}

PhotoList.prototype.exists = function(path) {
	return this.list.some( p => p.filename === path );
}

PhotoList.prototype.filter = function(path) {
	return this.list.filter( p => p.filename === path );
}

function Photo(filename, img, orientation) {
	this.filename = filename;
	this.img = img;
	this.orientation = orientation;

	this.effect = null;
	this.adjustment = '';
}