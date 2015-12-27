'use strict';

const electron = require('electron');
const remote = electron.remote;
const nativeImage = electron.nativeImage
const fs = require('fs');

let win = remote.getCurrentWindow();

let figure = document.getElementById('big').querySelector('figure')
let b = figure.getBoundingClientRect()
var o = {
	x: b.left,
	y: b.top,
	width: b.width,
	height: b.height
};

// caveat - bounds must entirely be inside chrome's viewport!!
// to capture this offscreen, see https://github.com/atom/electron/issues/2610
win.capturePage(o, img => {
	console.log(img.getSize())
	fs.writeFileSync('screenshot.png', img.toPng());
	fs.writeFileSync('screenshot.jpg', img.toJpeg(100));
});

// pdf capture
let options = {
	marginType: 0,
	printBackground: true,
	printSelectionOnly: false,
	landscape: false
};

win.printToPDF(options, function (err, data) {
	if (err) return console.error(err);
	fs.writeFile('test.pdf', data, function (err) {
		if (err) console.error(err);
	});
});