'use strict';

// model representation of photos to load

function PhotoList() {
	this.list = []; // new Set();

	// this.selection
}

PhotoList.prototype.add = function(photo) {
	this.list.push(photo);
	this.save();
}

PhotoList.prototype.remove = function(photo) {
	var i = this.list.indexOf(photo);
	this.list.slice(i, 1);
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

PhotoList.prototype.save = function() {
	localStorage.lastLoad = JSON.stringify(this.filenames());
}

function Photo(filename, img) {
	this.filename = filename;
	this.img = img;

	// styles
	// adjustments
}