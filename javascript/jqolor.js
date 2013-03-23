// http://docs.jquery.com/Plugins/Authoring
(function( $ ) {
	var methods = {
		calculatCurrentlySelectedColor : calculatCurrentlySelectedColor,
		init                           : jQolor_init,
		handlePickerChange             : handlePickerChange,
		hide                           : jQolor_hide,
		onHueToolClickOrDrag           : onHueToolClickOrDrag,
		onPickerButtonClick            : onPickerButtonClick,
		onPickerToolClickOrDrag        : onPickerToolClickOrDrag,
		onPickerToolStartDragClosure   : onPickerToolStartDragClosure,
		onPickerToolStopDragClosure    : onPickerToolStopDragClosure,
		onTextInputKeyUp               : onTextInputKeyUp,
		setHex                         : setHex,
		setHueSliderPosition           : setHueSliderPosition,
		setPickerPointerPosition       : setPickerPointerPosition,
		show                           : jQolor_show
	};
	
	var currentHex;
	var currentHue;
	var currentPerceivedBrightness = 0;
	var currentRGB = { red: 0, green: 0, blue: 0 };
	var currentHSB = { hue: 0, saturation: 0, brightness: 0 };
	var hueSlider;
	var hueSliderMarker;
	var picker;
	var pickerButton;
	var pickerButtonIcon;
	var pickerContainer;
	var pickerPointer;
	var pickerX = 0;
	var pickerY = 0;
	var textInput;
	var visible;
	
	$.fn.jQolor = function( method ) {
		if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else if ( methods[ method ] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.jQolor' );
		}
	};
	
})( jQuery );

function jQolor_init( options ) { 
	var settings =
		$.extend( {
			'color'       : 'FF0000',
			'colorChange' : null
		}, options );
	
	var textInputId = this.attr( 'id' );
	
	// Transform DOM object into jQolor
	var html  = '<!-- jQolor-generated HTML -->';
	    html += '<div class="input-prepend input-append jqolor">';
	    html += '	<span class="add-on">#</span>';
	    html += '	<input id="' + textInputId + '" name="' + this.attr( 'name' ) + '" type="text" maxlength="6" />';
	    html += '	<div id="picker-button" class="btn">';
	    html += '		Go!';
	    html += '		<i id="picker-button-icon" class="icon-search"></i>';
	    html += '	</div>';
	    html += '</div>';
	    html += '<div id="picker-container" class="picker-container">'
	    html += '	<div class="float">'
		html +=	'		<div id="picker" class="pull-left picker">';
		html +=	'			<img id="picker-pointer" class="picker-pointer" src="images/picker-pointer-light.gif" />';
		html +=	'		</div>';
		html +=	'		<div id="hue-slider" class="pull-left hue-slider">';
		html +=	'			<img id="hue-slider-marker" class="hue-slider-marker" src="images/hue-slider-marker.png" />';
		html +=	'		</div>';
		html +=	'	</div>';
		html +=	'</div>';
	this.replaceWith( html );
	
	// Grab convenience handles on all of our newly-created DOM objects
	// TODO: Enforce UIDs on these or we'll run into collisions.
	this.pickerContainer = $('#picker-container');
	this.textInput = $('#' + textInputId);
	this.picker = $('#picker');
	this.pickerButton = $('#picker-button');
	this.pickerButtonIcon = $('#picker-button-icon');
	this.pickerPointer = $('#picker-pointer');
	this.hueSlider = $('#hue-slider');
	this.hueSliderMarker = $('#hue-slider-marker');
	
	// Prevent touchable components from showing drag indicators.
	this.pickerPointer.on(   'dragstart', function( event ) { event.preventDefault(); } );
	this.hueSliderMarker.on( 'dragstart', function( event ) { event.preventDefault(); } );
	
	instance = this;
	
	// Assign mouse/touch event handlers.
	this.hueSlider.onToolClickOrDrag(
		function( event ) {
			return instance.jQolor( 'onHueToolClickOrDrag', event );
		} );
	this.picker.onToolClickOrDrag(
		function( event ) {
			return instance.jQolor( 'onPickerToolClickOrDrag', event );
		},
		function( event ) {
			return instance.jQolor( 'onPickerToolStartDragClosure', event );
		},
		function( event ) {
			return instance.jQolor( 'onPickerToolStopDragClosure', event );
		} );
	
	this.textInput.keyup(
		function( event ) {
			return instance.jQolor( 'onTextInputKeyUp', event );
		} );
	this.textInput.focus(
		function( event ) {
			return instance.jQolor( 'show', event );
		} );
	
	this.pickerButton.on( 'vclick',
		function( event ) {
			return instance.jQolor( 'onPickerButtonClick', event );
		} );
	
	if ( settings.colorChange != null ) {
		this.bind( 'colorChange', settings.colorChange );
	}
	
	// Set default color
	this.jQolor( 'setHex', settings.color );
	this.jQolor( 'hide', 0 );
	
	return this;
}

function onPickerButtonClick( event ) {
	if ( this.visible ) {
		this.jQolor( 'hide' );
	} else {
		this.jQolor( 'show' );
	}
}

function jQolor_show( duration ) {
	this.pickerContainer.fadeIn( duration != undefined ? duration : 400 );
	this.pickerButtonIcon.attr( 'class', 'icon-ok' );
	
	this.visible = true;
}

function jQolor_hide( duration ) {
	this.pickerContainer.fadeOut( duration != undefined ? duration : 400 );
	this.pickerButtonIcon.attr( 'class', 'icon-search' );
	
	this.visible = false;
}

function onTextInputKeyUp( event ) {
	var value = this.textInput.val();
	
	code = event.keyCode ? event.keyCode : event.which;

	if ( code == 13 ) {
		this.jQolor( 'hide' );
		return;
	}
	
	if ( value.length != 6 ) return;
	
	this.jQolor( 'setHex', value );
}

function onPickerToolClickOrDrag( event ) {	
	var bounds = this.picker.globalToLocal( event.pageX, event.pageY );
	var width = this.picker.width();
	var height = this.picker.height();
	
	this.pickerX = Math.max( Math.min( bounds.x, width ), 0 );
	this.pickerY = Math.max( Math.min( bounds.y, height ), 0 );
	
	this.jQolor( 'setPickerPointerPosition', this.pickerX / width, this.pickerY / height );
	
	// Convert coordinates to 0-1 value representing a location within the picker width and height.
	this.jQolor( 'handlePickerChange', this.pickerX / this.picker.width(), this.pickerY / this.picker.height() );
	
	// Hide picker indicator in favor of cusor if the user is actively dragging around within the picker.
	// One exception is click events; don't hide the cursor for those guys.
	if ( event.type == 'click' ) {
		this.pickerPointer.css( 'opacity', 1.0 );
	} else if ( this.picker.hitTestPoint( event.pageX, event.pageY ) ) {
		this.pickerPointer.css( 'opacity', 0.0 );
	} else {
		this.pickerPointer.css( 'opacity', 1.0 );
	}
}
function onPickerToolStartDragClosure() {
	// No-op
}
function onPickerToolStopDragClosure() {
	this.pickerPointer.css( 'opacity', 1.0 );
}

function onHueToolClickOrDrag( event ) {
	var bounds = this.hueSlider.globalToLocal( event.pageX, event.pageY );

	var y = Math.max( Math.min( bounds.y, this.hueSlider.height() ), 0 ) / this.hueSlider.height();
	
	this.jQolor( 'setHueSliderPosition', y );
	
	//this.currentHue = getSelectedHueFromPixelPosition( y );
	this.currentHue = getSelectedHueFromYPosition( y );
	
	this.picker.css( 'background-color', '#' + this.currentHue );
	
	this.jQolor( 'handlePickerChange', this.pickerX, this.pickerY );
}

// Expects coordinates in a format ranging from 0-1
function handlePickerChange( x, y ) {
	this.pickerX = x;
	this.pickerY = y;
	
	this.pickerPointer.attr( "src", y < .4 && x < .4 ? 'images/picker-pointer-dark.gif' : 'images/picker-pointer-light.gif' );
	
	this.jQolor( 'calculatCurrentlySelectedColor', x, y );
	
	//console.log( 'handlePickerChange(): x = ' + x + ', y = ' + y + ', hex = ' + this.currentHex );
	
	//this.textInput.css('background-color', '#' + this.currentHex );
	this.textInput.val( this.currentHex.toUpperCase() )
	//this.textInput.css( 'color', this.currentPerceivedBrightness < 127 ? '#FFFFFF' : '#000000' );
	
	this.trigger(
		'colorChange',
		{
			hex: this.currentHex,
			red: this.currentRGB.red,
			green: this.currentRGB.green,
			blue: this.currentRGB.blue,
			hue: this.currentHSB.hue,
			saturation: this.currentHSB.saturation,
			brightness: this.currentHSB.brightness
		} );
}

// Updates the hue-slider and picker to the color specified (as a hex string).
function setHex( hex ) {
	var rgb = hex2rgb( hex );
	var hsb = rgb2hsb( rgb );
	
	var hueHeight = this.hueSlider.height();
	
	// Convert hue to y position within slider, then normalize for helper function
	var hueY = parseInt( hueHeight - ( hueHeight * hsb.hue ) / 360, 10 ) / hueHeight;
	
	// Solid grays will not have a hue, so we should just leave the previously selected hue for now.
	if ( !isNaN( hueY ) ) {
		this.jQolor( 'setHueSliderPosition', hueY );
		this.currentHue = getSelectedHueFromYPosition( hueY );
		this.picker.css( 'background-color', '#' + this.currentHue );
	}
	
	// Convert brightness and saturation to x & y positions within picker, then normalize for helper function
	var ppX = parseInt( this.picker.width() * hsb.saturation / 100, 10 ) / this.picker.width();
	var ppY = parseInt( this.picker.height() * ( 100 - hsb.brightness ) / 100, 10 ) / this.picker.height();
	
	this.jQolor( 'handlePickerChange', ppX, ppY );
	this.jQolor( 'setPickerPointerPosition', ppX, ppY );
}

// Adjusts the vertical position of the hue slider (indicator) based on a 0-1 value.
// 0 is top and 1 is bottom.
function setHueSliderPosition( value ) {
	var offset = this.hueSlider.offset();
	var markerX = offset.left + 1;
	var markerY = offset.top + value * this.hueSlider.height() - this.hueSliderMarker.height() / 2;
	
	this.hueSliderMarker.offset( { left: markerX, top: markerY } );
	
	//console.log( "setHueSliderPosition(): value = " + value + ", y = " + markerY );
}

// Adjusts the position of the picker-pointer based on horizontal and vertical 0-1 values.
// 0 is far-left or top and 1 is far-right or bottom.
function setPickerPointerPosition( horizontalValue, verticalValue ) {
	var offset = this.picker.offset();
	
	var pickerPointerX = offset.left + horizontalValue * this.picker.width()  - this.pickerPointer.width() / 2;
	var pickerPointerY = offset.top  + verticalValue   * this.picker.height() - this.pickerPointer.height() / 2;
	
	this.pickerPointer.offset( { left: pickerPointerX, top: pickerPointerY } );
}

function calculatCurrentlySelectedColor( x, y ) {
	rgb = hex2rgb( this.currentHue );
	
	var whiteLevel = 1 - x;
	var colorLevel = 1 - whiteLevel;
	
	rgb.red   = Math.round( rgb.red   * colorLevel + 255 * whiteLevel );
	rgb.green = Math.round( rgb.green * colorLevel + 255 * whiteLevel );
	rgb.blue  = Math.round( rgb.blue  * colorLevel + 255 * whiteLevel );
	
	var blackLevel = y;
	var colorLevel = 1 - blackLevel;
	
	rgb.red   = Math.round( rgb.red   * colorLevel );
	rgb.green = Math.round( rgb.green * colorLevel );
	rgb.blue  = Math.round( rgb.blue  * colorLevel );
	
	this.currentRGB = rgb;
	this.currentHex = rgb2hex( rgb.red, rgb.green, rgb.blue );
	this.currentHSB = rgb2hsb( rgb );
	
	// http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
	var r = rgb.red;
	var g = rgb.green;
	var b = rgb.blue;
	this.currentPerceivedBrightness = ( r + r + b + g + g + g ) / 6;
	this.currentPerceivedBrightness = ( r + r + r + b + g + g + g + g ) >> 3;
	
	//console.log( 'calculatCurrentlySelectedColor(): x = ' + x + ', y = ' + y + ', hex = ' + this.currentHex + ', perceived-brightness: ' + this.currentPerceivedBrightness );
}

// Uses an HTML5 Canvas to detect the color of a specific pixel in the hue picker.
function getSelectedHueFromPixelPosition( y ) {
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.drawImage( document.getElementById('hue-slider-image'), 0, 0 );
	
	var data = context.getImageData( 0, y, 1, 1 ).data;
	
	var hex = rgb2hex( data[0], data[1], data[2] );
	
	return hex;
}

// Calculates the hue from the y position within the red-to-blue-to-green gradient.
function getSelectedHueFromYPosition( y ) {
	var r = 0;
	var g = 0;
	var b = 0;
	
	// 0.000 - 0.167 (full red)
	// 0.833 - 1.000 (full red)
	if ( y <= .167 || y >= .833 ) {
		r = 1;
	// 0.167 - 0.333 (red tapers)
	} else if ( y <= .333 ) {
		r = 1 - ( ( y - .167 ) / .167 );
	// 0.667 - 0.833 (red builds)
	} else if ( y >= 0.667 ) {
		r = ( y - 0.667 ) / .167;
	}
	
	// 0.167 - 0.500 (full blue)
	if ( y >= .167 && y <= .5 ) {
		b = 1;
	// 0.000 - 0.167 (blue builds)
	} else if ( y <= .167 ) {
		b = y / .167;
	// 0.500 - 0.666 (blue tapers)
	} else if ( y >= .5 && y <= .666 ) {
		b = 1 - ( ( y - .5 ) / .167 );
	}
	
	// 0.500 - 0.833 (full green)
	if ( y >= .5 && y <= .833 ) {
		g = 1;
	// 0.333 - 0.500 (green builds)
	} else if ( y >= .333 && y <= .5 ) {
		g = ( y - .333 ) / .167;
	// 0.833 - 1.000 (green tapers)
	} else if ( y >= .833 ) {
		g = 1 - ( ( y - .833 ) / .167 );
	}
	
	r = Math.round( r * 255 );
	b = Math.round( b * 255 );
	g = Math.round( g * 255 );
	
	hex = rgb2hex( r, g, b );
	
	//console.log( 'getSelectedHueFromYPosition(): y = ' + y + ', hex = ' + hex );
	
	return hex;
}