'use strict';

const electron = require('electron');
const remote = electron.remote;
const nativeImage = electron.nativeImage
const fs = require('fs');

let win = remote.getCurrentWindow();

var figure = document.getElementById('figure');
function load (photo, style, filename, longest) {
	while (figure.firstChild) {
		figure.removeChild(figure.firstChild);
	}

	figure.style.cssText = `max-width: ${longest}; max-height: ${longest}`;

	console.time('load');

	var img = new Image();
	img.src = photo;
	figure.appendChild(img);

	img.onload = () => {
		console.timeEnd('load');
		console.time('raf');

		var count = 0;
		var wait = function() {
			count++;
			if (count < 3 || win.isLoading()) {
				// not sure if this actually is useful.
				// 'did-stop-loading'
				return requestAnimationFrame(wait);
			}
			console.timeEnd('raf')
			console.log(filename, img);
			save(filename, img);
		}
		requestAnimationFrame(wait);
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
	win.focus();

	// caveat - bounds must entirely be inside chrome's viewport!!
	win.capturePage(o, img => {
		// console.log(img.getSize())
		// fs.writeFileSync('screenshot.png', img.toPng());
		fs.writeFileSync(filename, img.toJpeg(98));
		win.close();

		// // could make an ipc call here instead.
		// electron.ipcRenderer.send('signal', 'done');
	});
}