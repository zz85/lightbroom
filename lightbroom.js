'use strict';

var opener = new ImageOpener(processImage);
var count = 0;
var maxLength = 240;

var preview = document.getElementById('preview');
var filters = document.getElementById('filters');
var peeks = document.getElementById('peeks');
var big = document.getElementById('big'), bigimg;

var styles = [
	"Nofilter",
	"Aden",
	"Inkwell",
	"Perpetua",
	"Reyes",
	"Gingham",
	"Toaster",
	"Walden",
	"Hudson",
	"Earlybird",
	"Mayfair",
	"Lofi",
	"_1977",
	"Brooklyn",
	"Xpro2",
	"Nashville",
	"Lark",
	"Moon",
	"Clarendon",
	"Willow"
];

var currentStyle = 'nofilter';
var saved;
var filterItems = new Map();

var filenames;
var selectedPhoto;

var photos = new PhotoList();

styles.forEach( function(s) {
	var div = document.createElement('div');

	var b = document.createElement('b');
	b.className = 'effect';


	b.onclick = function() {
		var last = document.querySelector('.selected-effect');
		if (last) last.classList.remove('selected-effect');
		b.querySelector('img').classList.add('selected-effect');

		saved = currentStyle;
		switchStyle(s);
	}

	b.onmouseover = function() {
		saved = currentStyle;
		switchStyle(s);
	}

	b.onmouseout = function() {
		switchStyle(saved);
	}

	div.appendChild(b);

	var figure = document.createElement('figure');
	b.appendChild(figure);
	b.innerHTML += s;

	filterItems.set(s, div);
	filters.appendChild(div);
} )


function switchStyle(s) {
	var old = currentStyle;

	var pics = document.querySelectorAll('.pic, .big')

	for (var i = 0; i < pics.length; i ++) {
		var p = pics[i];
		p.classList.remove(old);
		p.classList.add(s);
	}

	currentStyle = s;
}

var x = 0;

var tmp;
var save;

var img = big;
var lasty;

img.onmouseover = function(e) {
	save = currentStyle;
}

img.onmousemove = function(e) {
	// code here to reimplement scrubbing behaviour
	// (potatoe prototype6)
}

img.onmouseout = function(e) {
	if (!bigimg) return;
	tmp = bigimg.classList[1];
	bigimg.classList.remove(tmp);
	bigimg.classList.add(currentStyle);
}

img.onmousedown = function(e) {
	save = bigimg.classList[1];
	switchStyle(save);
}

function previewBig(oimg, photo, orientation) {
	selectedPhoto = photo;

	var img = scaleImage(oimg, 590, orientation);

	var child;
	while (child = big.childNodes[0]) {
		child.remove();
	}

	var n = document.createElement('figure');
	n.appendChild(img.cloneNode());
	n.classList.add('big');
	n.classList.add(currentStyle);
	bigimg = n;

	big.appendChild(n);

	// img = scaleImage(oimg, maxLength, orientation);

	img = scaleImage(img, maxLength);

	img.onload = () => {

	styles.forEach(function(s) {
		var m = filterItems.get(s).querySelector('figure');

		while (child = m.firstChild) {
			child.remove();
		}

		m.appendChild(img.cloneNode());

		while (m.classList.length) {
			m.classList.remove(m.classList[0]);
		}
		m.classList.add('peek');
		m.classList.add(s);

	});

	}

}

function scaleImage(img, maxLength, orientation) {
	var canvas = getCanvas(img, maxLength, orientation);

	var image = new Image();
	image.src = canvas.toDataURL("image/png");

	return image;
}

function getCanvas(img, maxLength, orientation) {
	var imgWidth = img.naturalWidth;
	var imgHeight = img.naturalHeight;

	// can rotate here....

	var scale = imgWidth > imgHeight ? maxLength / imgWidth : maxLength / imgHeight;

	var canvas = document.createElement('canvas');
	var ctx = canvas.getContext('2d');

	var targetWidth = imgWidth * scale;
	var targetHeight = imgHeight * scale;

	canvas.width = targetWidth;
	canvas.height = targetHeight;
	if (orientation > 4) {
		canvas.width = targetHeight;
		canvas.height = targetWidth;
	}

	var width = targetWidth;
	var height = targetHeight;

	switch (orientation) {
		case 2:
			// horizontal flip
			ctx.translate(width, 0);
			ctx.scale(-1, 1);
			break;
		case 3:
			// 180° rotate left
			ctx.translate(width, height);
			ctx.rotate(Math.PI);
			break;
		case 4:
			// vertical flip
			ctx.translate(0, height);
			ctx.scale(1, -1);
			break;
		case 5:
			// vertical flip + 90 rotate right
			ctx.rotate(0.5 * Math.PI);
			ctx.scale(1, -1);
			break;
		case 6:
			// 90° rotate right
			ctx.rotate(0.5 * Math.PI);
			ctx.translate(0, -height);
			break;
		case 7:
			// horizontal flip + 90 rotate right
			ctx.rotate(0.5 * Math.PI);
			ctx.translate(width, -height);
			ctx.scale(-1, 1);
			break;
		case 8:
			// 90° rotate left
			ctx.rotate(-0.5 * Math.PI);
			ctx.translate(-width, 0);
			break;
	}

	ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

	return canvas;
}

// var filenames = [];
// filenames.push(files[i].path);
// localStorage.lastLoad = JSON.stringify(filenames);
// console.log('Got Files', filenames);

function processImage(oImg, path, i) {
	EXIF.getData(oImg, function() {
		var exif = EXIF.getAllTags(oImg);
		processImage2(oImg, path, i, exif);
	});
}

function processImage2(oImg, path, i, exif) {
	var orientation = exif.Orientation;
	var photo = new Photo(path, oImg, orientation);
	photos.add( photo );

	// console.log('process image');

	// var canvas = getCanvas(img, 550);
	// inlineSVGImg(canvas.toDataURL(), canvas.width, canvas.height);

	if (photos.count() == 1) {
		previewBig(oImg, photo, orientation);
	}

	var img = scaleImage(oImg, 390, orientation);

	var figure = document.createElement('figure');
	figure.classList.add('pic');
	figure.classList.add(currentStyle);
	figure.appendChild(img);

	preview.appendChild(figure);

	figure.scrollIntoView(false, 200);

	img.onclick = function() {
		togglePreviewSlider(1);
		previewBig(oImg, photo, orientation);
	}

	sizeThumbnails(lastThumbnailSize);

}
var toggled = 0;

/* Actions */
function togglePreviewSlider(x) {
	toggled =  x !== undefined ? x : toggled;
	switch (toggled) {
		case 0:
			preview.style.height = '80%';
			break;
		case 1:
			preview.style.height = '300px';
			break;
		case 2:
			preview.style.height = '10px';
			break;
	}

	toggled = (toggled + 1) % 3;
}

var lastThumbnailSize = 200;
function sizeThumbnails(size) {
	lastThumbnailSize = 200;
	Array.from(document.querySelectorAll('#preview figure')).forEach(
		d => {
			var i = d.querySelector('img');
			i.style.width = 'auto';
			// i.style.height =  `100%`;
			i.style.height =  `${size}px`;
			// d.style.maxWidth =`${size}px`;
			// d.style.maxHeight = `${size * 0.67}px`;
			// d.style.maxHeight = `auto`;
			// d.style.maxHeight = `${size}px`;
		}
	)
}

function clearThumbnails() {
	photos.empty();
	location.reload();
}

var effectsTray = true;

function toggleEffects() {
	if (effectsTray) {
		filters.style.height = '0px';
		effectsTray = false;
	} else {
		filters.style.height = '128px';
		effectsTray = true;
	}
}


var slider = document.getElementById('preview-slider');
slider.onmousedown = function() {

	var moved = false;

	var onmove = function(e) {
		moved = true;
		var x = window.innerHeight - e.screenY;

		preview.style.height = x + 'px';
	};

	var onup = function() {
		if (!moved) {
			togglePreviewSlider();
		}

		window.removeEventListener('mousemove', onmove);
		window.removeEventListener('mouseup', onup);
	}

	window.addEventListener('mousemove', onmove);
	window.addEventListener('mouseup', onup);
}