// this file extends the web app with file system + electron capabilities

if (typeof(global) === 'object') {
	// check that we are in electron. then we cheat.
	var lastLoad = localStorage.lastLoad;
	if (lastLoad) {
		var filenames = JSON.parse(lastLoad);
		// TODO move this to PhotoList deserializer

		filenames.forEach( (f, i) => {
			console.log('Previously loaded', f);
			var now = Date.now();
			var img = new Image();
			img.src = 'file://' + f;
			img.onload = function() {
				console.log('loaded', Date.now() - now);
				processImage(img, f, i);
			}
		} );
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

		var localScreen = electron.screen
		// var display = localScreen.getPrimaryDisplay().workAreaSize;
		var start = Date.now();

		if (!win) {
			win = new remote.BrowserWindow ({
				x: 0, // display.width
				y: 0, // display.height
				width: currentImage.naturalWidth + 500 * 1,
				height: currentImage.naturalHeight + 500 * 1,
				// resizable: false,
				'skip-taskbar': true,
				show: false,
				'enable-larger-than-screen': true
			});

			win.loadURL(`file://${__dirname}/capture-image.html`);

			console.log('saving image', selectedFile, currentStyle, out);
			win.webContents.on('did-finish-load', function() {
				console.log('did-finish-load')
				// window.webContents.send('ping', 'whoooooooh!');
				win.webContents.executeJavaScript(`load('${selectedFile}', '${currentStyle}', '${out}')`);
			});
		} else {
			win.webContents.executeJavaScript(`load('${selectedFile}', '${currentStyle}', '${out}')`);
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