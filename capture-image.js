'use strict';

const electron = require('electron');
const remote = electron.remote;
const nativeImage = electron.nativeImage
const fs = require('fs');

let win = remote.getCurrentWindow();

var figure = document.getElementById('figure');
function load (photo, style, filename) { // size
	console.log('load', arguments);
	while (figure.firstChild) {
		figure.removeChild(figure.firstChild);
	}

	console.time('load');

	var img = new Image();
	img.src = photo;
	figure.appendChild(img);

	img.onload = () => {
		console.timeEnd('load')
		console.time('raf')
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				console.timeEnd('raf')
				console.log(filename, img);
				save(filename, img);
			});
		});
	};

	figure.className = style;
}

function save(filename, img) {
	let b = img.getBoundingClientRect();

	var o = {
		x: b.left,
		y: b.top,
		width: b.width,
		height: b.height
	};

	// console.log(o);
	// win.show();
	// win.focus();

	// caveat - bounds must entirely be inside chrome's viewport!!
	// to capture this offscreen, see https://github.com/atom/electron/issues/2610
	// some how this is not required in chrome 35
	win.capturePage(o, img => {
		// console.log(img.getSize())
		// fs.writeFileSync('screenshot.png', img.toPng());
		fs.writeFileSync(filename, img.toJpeg(98));
		win.close();
	});
}