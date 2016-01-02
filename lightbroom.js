'use strict';

var MAX_EFFECT_PREVIEW_LENGTH = 240;
var MAX_BIG_PREVIEW_LENGTH = 1600; // || 590;
var FILMSTRIP_THUMBNAIL_LENGTH = 390;;

var opener = new ImageOpener(processImage);

var preview = document.getElementById('preview');
var filters = document.getElementById('filters');
var big = document.getElementById('big'), bigimg;
var filmstrip = document.getElementById('filmstrip');

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

setup();

function setup() {
	// add styled effect
	styles.forEach( function(s) {
		var div = document.createElement('div');

		var b = document.createElement('b');
		b.className = 'effect';

		b.onclick = function() {
			var last = document.querySelector('.selected-effect');
			if (last) last.classList.remove('selected-effect');
			b.querySelector('img').classList.add('selected-effect');

			saved = currentStyle;
			switchStyle(s, true);
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
	} );

	// setup big image preview

	// var x = 0;

	// var tmp;
	// var save;

	// var img = big;

	// img.onmouseover = function(e) {
	// 	save = currentStyle;
	// }

	// img.onmousemove = function(e) {
	// 	// code here to reimplement scrubbing behaviour
	// 	// (potatoe prototype6)
	// }

	// img.onmouseout = function(e) {
	// 	if (!bigimg) return;
	// 	tmp = bigimg.classList[1];
	// 	bigimg.classList.remove(tmp);
	// 	bigimg.classList.add(currentStyle);
	// }

	// img.onmousedown = function(e) {
	// 	save = bigimg.classList[1];
	// 	switchStyle(save);
	// }
}


function switchStyle(s, commit) {
	var old = currentStyle;

	// photos.selection.forEach( p => {
	// 	p.effect = s;
	// });

	// photosDomSync();

	var pics = document.querySelectorAll('.pic, .big')

	for (var i = 0; i < pics.length; i ++) {
		var p = pics[i];
		p.classList.remove(old);
		p.classList.add(s);
	}

	currentStyle = s;
}

function previewBig(oimg, photo, orientation) {
	selectedPhoto = photo;

	var img = scaleImage(oimg, MAX_BIG_PREVIEW_LENGTH, orientation);

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

	img = scaleImage(img, MAX_EFFECT_PREVIEW_LENGTH);

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

	var img = scaleImage(oImg, FILMSTRIP_THUMBNAIL_LENGTH, orientation);

	var div = document.createElement('div');
	div.dataset.path = path;

	var checkbox = document.createElement('div');
	checkbox.className = 'checkbox';

	var lb = document.createElement('label');
	lb.innerHTML = '✔';

	var cb = document.createElement('input');
	cb.type = 'checkbox';
	cb.onchange = function() {
		if (cb.checked) {
			lb.classList.add('checked');
			photos.selection.add( photo );
		} else {
			lb.classList.remove('checked');
			photos.selection.delete( photo );
		}
	}

	lb.appendChild(cb);

	// ✔☑✓✓
	checkbox.appendChild(lb);

	var figure = document.createElement('figure');
	figure.classList.add('pic');
	figure.classList.add(currentStyle);
	figure.appendChild(img);

	div.appendChild(checkbox);
	div.appendChild(figure);

	// div.innerHTML += path;

	filmstrip.appendChild(div);
	figure.scrollIntoView(false, 200);

	img.onclick = function() {
		cb.checked = !cb.checked;
		cb.onchange();
		previewBig(oImg, photo, orientation);
	}

	/*
		photos.remove(photo);
		photosDomSync();
	*/


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
	var proceed = confirm('Remove all photos?');
	if (!proceed) return;
	photos.empty();
	photosDomSync();
}

function removeSelection() {
	var proceed = confirm('Remove ' + photos.selection.size + ' photos?');
	if (!proceed) return;
	photos.selection.forEach(photos.remove.bind(photos));
	photosDomSync();
}

var toggleSelectAll = false;

function selectAll() {
	// photos.list.forEach(photos.selection.add.bind(photos));
	// photosDomSync();

	toggleSelectAll = !toggleSelectAll;

	Array.from(document.querySelectorAll('#filmstrip input')).forEach(
		cb => {
			cb.checked = toggleSelectAll;
			cb.onchange();
		}
	)
}

function photosDomSync() {
	var dom = Array.from(document.querySelectorAll('[data-path]'))

	dom.forEach( d => {
		var match = photos.filter(d.dataset.path);

		// remove
		if (! match.length ) {
			return d.remove();
		}

		// update
		var img = d.querySelector('.pic');
		img.className = 'pic ' + match[0].effect;
	} );
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
		preview.style.transition = 'none';
		e.stopPropagation();
		e.preventDefault();
		// preview.classList.add('no-transition');
	};

	var onup = function() {
		if (!moved) {
			togglePreviewSlider();
		}
		// preview.classList.remove('no-transition');
		preview.style.transition = '';

		window.removeEventListener('mousemove', onmove);
		window.removeEventListener('mouseup', onup);
	}

	window.addEventListener('mousemove', onmove);
	window.addEventListener('mouseup', onup);
}