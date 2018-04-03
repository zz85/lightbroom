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
			<filter id="brightness_threshold">
				<feComponentTransfer>
					<feFuncR type="linear" slope="1.5" intercept="-0.3"/>
					<feFuncG type="linear" slope="1.5" intercept="-0.3"/>
					<feFuncB type="linear" slope="1.5" intercept="-0.3"/>
				</feComponentTransfer>
			</filter>

			<filter id="css_opacity">
				<feComponentTransfer>
					<feFuncA type="table" tableValues="0 0.5"/>
				</feComponentTransfer>
			</filter>

			<filter id="css_invert">
				<feComponentTransfer>
					<feFuncR type="table" tableValues="1 0"/>
					<feFuncG type="table" tableValues="1 0"/>
					<feFuncB type="table" tableValues="1 0"/>
				</feComponentTransfer>
			</filter>

			<filter id="gamma_correct">
				<feComponentTransfer>
					<feFuncG type="gamma" amplitude="1" exponent="0.5"/>
				</feComponentTransfer>
			</filter>

			<filter id="gamma_correct2">
				<feComponentTransfer>
				<feFuncG type="gamma" amplitude="1" exponent="0.5"
						offset="-0.1"/>
				</feComponentTransfer>
			</filter>

			<filter id="css_grayscale">
 				<feColorMatrix type="saturate" values="0"/>
			</filter>

			<filter id="css_saturate">
				<feColorMatrix type="saturate" values="10"/>
			</filter>

			<filter id="css_hue_rotate">
				<feColorMatrix type="hueRotate" values="180"/>
			</filter>

			<filter id="luminance_mask">
				<feColorMatrix type="luminanceToAlpha"/>
			</filter>

			<filter id="css_sepia">
				<feColorMatrix
				type="matrix"
				values=".343 .669 .119 0 0
						.249 .626 .130 0 0
						.172 .334 .111 0 0
						.000 .000 .000 1 0 "/>
			</filter>

			<filter id="dusk">
				<feColorMatrix
					type="matrix"
					values="1.0 0   0   0   0
							0   0.2 0   0   0
							0   0   0.2 0   0
							0   0   0   1.0 0 "/>
			</filter>

			<filter id="extremeEffect">
				<feConvolveMatrix order="5" kernelMatrix="1 1 1 1 1 1 -2 -2 -2 1 1  -2 .01 -2 1 1 -2 -2 -2 1 1 1 1 1 1"/>
 				<feColorMatrix type="luminanceToAlpha"/>
			</filter>

			<filter id="css_drop_shadow">
				<feGaussianBlur stdDeviation="2"  in="SourceAlpha" />
				<feOffset dx="4" dy="6"           result="offsetblur"/>
				<feFlood flood-color="#777"/>
				<feComposite operator="in"        in2="offsetblur"/>
				<feMerge>
					<feMergeNode/>
					<feMergeNode                    in="SourceGraphic"/>
				</feMerge>
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