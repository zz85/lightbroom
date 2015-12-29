// this file extends the web app with file system + electron capabilities

if (typeof(global) === 'object') {
	// check that we are in electron. then we cheat.
	var lastLoad = localStorage.lastLoad;
	if (lastLoad) {
		var filenames = JSON.parse(lastLoad);
		// TODO move this to PhotoList deserializer

		// var now = Date.now();
		// filenames.forEach( (filename, i) => {
		// 	console.log('Previously loaded', filename);

		// 	var img = new Image();
		// 	img.src = 'file://' + filename;
		// 	img.onload = function() {
		// 		console.log('loaded', Date.now() - now);
		// 		processImage(img, filename, i);
		// 	}
		// } );

		var fs = require('fs');

		filenames.forEach( (filename, i) => {
		     var buffer = fs.readFileSync(filename);

			// fs.readFile(filename, function(err, buffer) {;
				var now = Date.now();
				var img = document.createElement("img");
				//  img.src = objectURL;

				console.time('exif')
				var exif = EXIF.readFromBinaryFile(buffer.buffer);
				console.timeEnd('exif')

				img.src = filename;

				img.exifdata = exif;

				img.onload = function() {
					console.log('loaded', Date.now() - now);
					processImage(img, filename, i);
				}
		     })
		// });
	}

	function saveImage() {
		var out = selectedPhoto.filename.split('/').pop();
		out = `${__dirname}/captures/${out}`;
		saveImageTo(selectedPhoto, currentStyle, out);
	}

	function saveAll() {
		var items = photos.items();

		var start = Date.now();

		var ok = function() {
			var f = items.pop();
			if (!f) {
				console.log('Batch Done!', (Date.now() - start) / 1000);
				if (win) win.close();
				return;
			}

			var out = f.filename.split('/').pop();
			out = `${__dirname}/captures/${out}`;
			saveImageTo(f, currentStyle, out, ok);
		}

		ok();
	}

	var win;

	var electron = require('electron');
	var remote = electron.remote;

	window.onbeforeunload = function() {
		console.log('unloading...');
		if (win) {
			win.close();
			win = null;
		}

		// remote.ipcMain.removeAllListeners();
	}

	function saveImageTo(photo, currentStyle, out, done) {

		var selectedFile = photo.filename;
		var currentImage = photo.img;
		var orientation = photo.orientation;

		var localScreen = electron.screen
		// var display = localScreen.getPrimaryDisplay().workAreaSize;
		var start = Date.now();

		var longest = Math.max(currentImage.naturalWidth || 0, currentImage.natualHeight || 0);
		longest = 800;

		var width = currentImage.naturalWidth + 500 * 1;
		var height = currentImage.naturalHeight + 500 * 1;

		// var shift =
		if (orientation > 4) {
			var t = width;
			width = height;
			height = t;
		}

		width = longest + 200;
		height = longest + 200;

		if (!win) {
			win = new remote.BrowserWindow ({
				x: 0, // display.width
				y: 0, // display.height
				width: width,
				height: height,
				// resizable: false,
				'skip-taskbar': true,
				// show: false,
				'enable-larger-than-screen': true
			});

			win.loadURL(`file://${__dirname}/capture-image.html`);

			console.log('saving image', selectedFile, currentStyle, out);
			win.webContents.on('did-finish-load', function() {
				console.log('did-finish-load')
				// window.webContents.send('ping', 'whoooooooh!');
				win.webContents.executeJavaScript(`load('${selectedFile}', '${currentStyle}', '${out}', ${longest}, ${orientation})`);
			});
		} else {
			win.webContents.executeJavaScript(`load('${selectedFile}', '${currentStyle}', '${out}', ${longest}, ${orientation})`);
		}

		// function ok (sender, msg) {
		// 	console.log('image transferred', (Date.now() - start) / 1000);

		// 	remote.ipcMain.removeListener('signal', ok);

		// 	if (done) done();
		// }

		// remote.ipcMain.on('signal', ok);

		win.on('closed', function() {
			console.log('closed', (Date.now() - start) / 1000);
			win = null;

			if (done) {
				done();
			}
		});

		//
	}
}