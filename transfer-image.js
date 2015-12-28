// this file extends the web app with file system + electron capabilities

if (typeof(global) === 'object') {
	// check that we are in electron. then we cheat.
	var lastLoad = localStorage.lastLoad;
	if (lastLoad) {
		filenames = JSON.parse(lastLoad);

		filenames.forEach( (f, i) => {
			console.log(f);
			var now = Date.now();
			var img = new Image();
			img.src = f;
			img.onload = function() {
				console.log('loaded', Date.now() - now);
				processImage(img, i);
			}
		} );
	}

	function saveImage() {
		var out = selectedFile.split('/').pop();
		out = `${__dirname}/captures/${out}`;
		saveImageTo(selectedFile, currentStyle, out);
	}

	function saveAll() {
		// filenames.forEach( (f, i) => {
		// 	var out = f.split('/').pop();
		// 	out = `${__dirname}/captures/${out}`;
		// 	saveImageTo(f, currentStyle, out);
		// });

		var filenames2 = filenames.concat();

		var start = Date.now();

		var ok = function() {
			var f = filenames2.pop();
			if (!f) {
				console.log('Batch Done!', (Date.now() - start) / 1000);
				if (win) win.close();
				return;
			}
			var out = f.split('/').pop();
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

	function saveImageTo(selectedFile, currentStyle, out, done) {

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

		function ok (sender, msg) {
			console.log('image transferred', (Date.now() - start) / 1000);

			remote.ipcMain.removeListener('signal', ok);

			if (done) done();
		}

		remote.ipcMain.on('signal', ok);

		// win.on('closed', function() {
		// 	console.log('closed', (Date.now() - start) / 1000);
		// 	win = null;

		// 	if (done) done();
		// });

		//
	}
}