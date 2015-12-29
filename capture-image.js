'use strict';

const electron = require('electron');
const remote = electron.remote;
const nativeImage = electron.nativeImage
const fs = require('fs');

let win = remote.getCurrentWindow();

var figure = document.getElementById('figure');
function load (photo, style, filename, longest, orientation) {
	while (figure.firstChild) {
		figure.removeChild(figure.firstChild);
	}

	console.time('load');

	if (longest) figure.style.cssText = `max-width: ${longest}px; max-height: ${longest}px;`;

	var img = new Image();
	img.src = photo;

	figure.appendChild(img);
	figure.className = style;

	console.log('orientation', arguments);

	if (orientation) figure.classList.add(`orientation${orientation}`);


	img.onload = () => {
		console.timeEnd('load');
		console.time('raf');

		// if (!longest) {
		// 	longest = 'auto';
		// 	figure.style.cssText = `max-width: ${longest}px; max-height: ${longest}px;`;
		// }

		if (orientation > 1) {
			let b = img.getBoundingClientRect();
			console.log(b);

			figure.style.cssText += `
				transform:
					translateX(${-b.left}px)
					translateY(${-b.top}px)
					rotate(-90deg)

					;
			`;
			// if (b.width > b.height) {
			// 	var diff = b.height - b.width / 2;
			// 	figure.style.cssText += `
			// 		transform:
			// 			translateY(${diff}px)
			// 			translateX(${-diff}px)
			// 			rotate(-90deg);
			// 	`;
			// }
		}

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
}

function save(filename, img) {
	let b = img.getBoundingClientRect();

	let o = {
		x: b.left,
		y: b.top,
		width: b.width,
		height: b.height
	};

	console.log(o);

	// caveat - bounds must entirely be inside chrome's viewport!!
	win.capturePage(o, img => {
		// console.log(img.getSize())
		// fs.writeFileSync('screenshot.png', img.toPng());
		fs.writeFileSync(filename, img.toJpeg(98));

		// turn this off if you need debugging
		win.close();

		// // could make an ipc call here instead.
		// electron.ipcRenderer.send('signal', 'done');
	});
}