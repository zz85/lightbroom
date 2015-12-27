function inlineSVGImg(data, width, height) {
	width = width || 20;
	hight = height || 20;
	var div = document.createElement('div');

	var svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
		 id="test" width="${width}" height="${height}" >
		 <defs>
			<!-- https://docs.webplatform.org/wiki/svg/tutorials/smarter_svg_filters -->
			<filter id="effect">
			</filter>
			<filter id="css_blur">
				<feGaussianBlur stdDeviation="10"/>
			</filter>
			<filter id="sideways_blur">
				<feGaussianBlur stdDeviation="10 1"/>
			</filter>

			<filter id="posterize">
				<feComponentTransfer>
					<feFuncR type="discrete"
						tableValues="0 0.2 0.4 0.6 0.8 1"/>
					<feFuncG type="discrete"
						tableValues="0 0.2 0.4 0.6 0.8 1"/>
					<feFuncB type="discrete"
						tableValues="0 0.2 0.4 0.6 0.8 1"/>
				</feComponentTransfer>
			</filter>

			<filter id="no_op">
				<feComponentTransfer>
					<feFuncR type="identity"/>
					<feFuncG type="identity"/>
					<feFuncB type="identity"/>
					<feFuncA type="identity"/>
				</feComponentTransfer>
			</filter>
			
			<filter id="css_brightness">
				<feComponentTransfer>
				<feFuncR type="linear" slope="0.5"/>
				<feFuncG type="linear" slope="0.5"/>
				<feFuncB type="linear" slope="0.5"/>
				</feComponentTransfer>
			</filter>
		</defs>
		<style>
		/* <![CDATA[ */
		.testing {
			filter: url(#posterize);
		}
		/* ]]> */
		</style>

		<image class="testing" width="${width}" height="${height}" xlink:href="data:image/png;${data}" />
	</svg>`;

	console.log(svg);

	div.innerHTML = svg;

	// proxy svg image
	var img = new Image()
	img.src = 'data:image/svg+xml;utf8,' + svg

	// write svg image to canvas for pixels
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	var context = canvas.getContext('2d');

	context.drawImage(img, 0, 0, width, height);
	// var a = document.createElement("a");
	// a.download = 'test.png';
	// a.href = canvas.toDataURL("image/png");
	// a.click()
	// z = cc.getImageData(0,0,c.width, c.height)


	document.body.appendChild(div);
}