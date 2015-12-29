//
// this is a simple image opener util file that supports
// image loading via
// 1. drag and drop
// 2. browsing
// 3. TODO clipboard paste
// Load 3. Integration as JS file for demo

function ImageOpener( processImage, target ) {

	var debug = true;
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
		window.URL = window.URL || window.webkitURL;
	} else {
		return console.error('The File APIs are not fully supported in this browser.');
	}

	target = target || document.body;

	// Input Field
	var input = document.createElement('input');
	input.type = 'file';
	input.addEventListener('change', handleFileSelect, false);
	this.input = input;

	// target.appendChild(input);

	target.onpaste = handlepaste;

	/***************************************
		Event handlers for file load
	****************************************/
	function handleFileSelect(evt) {
		var files = evt.target.files; // FileList object

		// files is a FileList of File objects. List some properties.
		for (var i = 0, f; f = files[i]; i++) {
			if (debug) {
				console.log( 'detected', f.name, f.type,
					f.size, ' bytes, last modified: ',
					f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a');
			}

			openFile(files[i], i);
		}
	}

	function handlepaste (e) {
		if (e && e.clipboardData && e.clipboardData.getData) {
			// Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
			// ii = e.clipboardData.getData('jpg/image');
			var items = e.clipboardData.items;

			var i = 0;
			if (items[i].kind == 'file' &&
			items[i].type.indexOf('image/') !== -1) {
				var blob = items[i].getAsFile();
				var blobUrl = URL.createObjectURL(blob);

				var img = document.createElement('img');
				img.src = blobUrl;
				img.onload = function(e) {
					processImage(img);
				};
			}

			// console.log(e, e.clipboardData.getData('text/plain'));
			if (e.preventDefault) {
					e.stopPropagation();
					e.preventDefault();
			}
			return false;
		}
	}
	/***************************************
		Event handlers for drag and drop
	****************************************/
	target.addEventListener('dragover', handleDragOver, false);
	target.addEventListener('dragenter', stopDefault, false);
	target.addEventListener('dragexit', stopDefault, false);

	target.addEventListener('drop', dropBehavior, false);

	/***************************************
		Event Callbacks for drag and drop
	****************************************/


	function handleDragOver(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	}


	function stopDefault(e) {
		e.preventDefault();
		return false;
	}

	function dropBehavior(e) {
		console.log('Files are dropped', e);
		e.stopPropagation();
		e.preventDefault();
		var files = e.dataTransfer.files;

		if (files.length) {
			for (var i = 0; i < files.length; i++) {
				openFile(files[i], i);
			}
		} else {
			// TODO support copypaste/clipboard drag in
		}
	}

	function openFile(file, i) {
		if (!file.type.match('image.*')) {
			if (debug) console.log('image fail');
			return;
		}
		
		var reader = new FileReader();
		reader.onloadend = function(e) {
			loadImage(e, file.path, i);
		};

		reader.onerror = errorHandler;

		reader.onprogress = updateProgress;
		reader.onabort = function(e) {
			console.log('File read cancelled');
		};

		reader.onloadstart = function(e) {
			console.log('onloadstart');
		};

		reader.onload = function(e) {
			console.log('onload');
		};

		reader.readAsArrayBuffer(file);
		// reader.readAsBinaryString(file);
		// reader.readAsDataURL(file);
	}

	function loadImage(e, path, i) {
		var arraybuffer = e.target.result;
		// console.log('loadImage', e); // e, target, reader, e.target.result
		
		// console.log(EXIF.readFromBinaryFile(arraybuffer));

		var blob = new Blob([arraybuffer]);
		var objectURL = URL.createObjectURL(blob);
		
		var img = document.createElement("img");
		img.src = objectURL;

		img.onload = function(e) {
			processImage(img, path, i);
		};
	}


	function updateProgress(e) {
		// evt is an ProgressEvent.
		if (e.lengthComputable) {
			var percentLoaded = Math.round((e.loaded / e.total) * 100);

			if (percentLoaded < 100) {
				console.log(percentLoaded + '%');
			}
		}
	}


	function errorHandler(e) {
		switch (e.target.error.code) {
			case e.target.error.NOT_FOUND_ERR:
				alert('File Not Found!');
				break;
			case e.target.error.NOT_READABLE_ERR:
				alert('File is not readable');
				break;
			case e.target.error.ABORT_ERR:
				break; // noop
			default:
				alert('An error occurred reading this file.' + e);
		}
	}

}