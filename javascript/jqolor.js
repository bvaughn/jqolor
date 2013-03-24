// http://docs.jquery.com/Plugins/Authoring
(function( $ ) {
	var methods = {
		calculatCurrentlySelectedColor  : jQolor_calculatCurrentlySelectedColor,
		init                            : jQolor_init,
		getSelectedHueFromPixelPosition : jQolor_getSelectedHueFromPixelPosition,
		getSelectedHueFromYPosition     : jQolor_getSelectedHueFromYPosition,
		handlePickerChange              : jQolor_handlePickerChange,
		hex2rgb                         : jQolor_hex2rgb,
		hide                            : jQolor_hide,
		onHueToolClickOrDrag            : jQolor_onHueToolClickOrDrag,
		onPickerButtonClick             : jQolor_onPickerButtonClick,
		onPickerToolClickOrDrag         : jQolor_onPickerToolClickOrDrag,
		onPickerToolStartDragClosure    : jQolor_onPickerToolStartDragClosure,
		onPickerToolStopDragClosure     : jQolor_onPickerToolStopDragClosure,
		onTextInputKeyUp                : jQolor_onTextInputKeyUp,
		rgb2hex                         : jQolor_rgb2hex,
		rgb2hsb                         : jQolor_rgb2hsb,
		setHex                          : jQolor_setHex,
		setHueSliderPosition            : jQolor_setHueSliderPosition,
		setPickerPointerPosition        : jQolor_setPickerPointerPosition,
		show                            : jQolor_show
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

function jQolor_onPickerButtonClick( event ) {
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

function jQolor_onTextInputKeyUp( event ) {
	var value = this.textInput.val();
	
	code = event.keyCode ? event.keyCode : event.which;

	if ( code == 13 ) {
		this.jQolor( 'hide' );
		return;
	}
	
	if ( value.length != 6 ) return;
	
	this.jQolor( 'setHex', value );
}

function jQolor_onPickerToolClickOrDrag( event ) {	
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
function jQolor_onPickerToolStartDragClosure() {
	// No-op
}
function jQolor_onPickerToolStopDragClosure() {
	this.pickerPointer.css( 'opacity', 1.0 );
}

function jQolor_onHueToolClickOrDrag( event ) {
	var bounds = this.hueSlider.globalToLocal( event.pageX, event.pageY );

	var y = Math.max( Math.min( bounds.y, this.hueSlider.height() ), 0 ) / this.hueSlider.height();
	
	this.jQolor( 'setHueSliderPosition', y );
	
	//this.currentHue = this.jQolor( 'getSelectedHueFromPixelPosition', y );
	this.currentHue = this.jQolor( 'getSelectedHueFromYPosition', y );
	
	this.picker.css( 'background-color', '#' + this.currentHue );
	
	this.jQolor( 'handlePickerChange', this.pickerX, this.pickerY );
}

// Expects coordinates in a format ranging from 0-1
function jQolor_handlePickerChange( x, y ) {
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
function jQolor_setHex( hex ) {
	var rgb = this.jQolor( 'hex2rgb', hex );
	var hsb = this.jQolor( 'rgb2hsb', rgb );
	
	var hueHeight = this.hueSlider.height();
	
	// Convert hue to y position within slider, then normalize for helper function
	var hueY = parseInt( hueHeight - ( hueHeight * hsb.hue ) / 360, 10 ) / hueHeight;
	
	// Solid grays will not have a hue, so we should just leave the previously selected hue for now.
	if ( !isNaN( hueY ) ) {
		this.jQolor( 'setHueSliderPosition', hueY );
		this.currentHue = this.jQolor( 'getSelectedHueFromYPosition', hueY );
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
function jQolor_setHueSliderPosition( value ) {
	var offset = this.hueSlider.offset();
	var markerX = offset.left + 1;
	var markerY = offset.top + value * this.hueSlider.height() - this.hueSliderMarker.height() / 2;
	
	this.hueSliderMarker.offset( { left: markerX, top: markerY } );
	
	//console.log( "setHueSliderPosition(): value = " + value + ", y = " + markerY );
}

// Adjusts the position of the picker-pointer based on horizontal and vertical 0-1 values.
// 0 is far-left or top and 1 is far-right or bottom.
function jQolor_setPickerPointerPosition( horizontalValue, verticalValue ) {
	var offset = this.picker.offset();
	
	var pickerPointerX = offset.left + horizontalValue * this.picker.width()  - this.pickerPointer.width() / 2;
	var pickerPointerY = offset.top  + verticalValue   * this.picker.height() - this.pickerPointer.height() / 2;
	
	this.pickerPointer.offset( { left: pickerPointerX, top: pickerPointerY } );
}

function jQolor_calculatCurrentlySelectedColor( x, y ) {
	rgb = this.jQolor( 'hex2rgb', this.currentHue );
	
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
	this.currentHex = this.jQolor( 'rgb2hex', rgb.red, rgb.green, rgb.blue );
	this.currentHSB = this.jQolor( 'rgb2hsb', rgb );
	
	// http://stackoverflow.com/questions/596216/formula-to-determine-brightness-of-rgb-color
	var r = rgb.red;
	var g = rgb.green;
	var b = rgb.blue;
	this.currentPerceivedBrightness = ( r + r + b + g + g + g ) / 6;
	this.currentPerceivedBrightness = ( r + r + r + b + g + g + g + g ) >> 3;
	
	//console.log( 'calculatCurrentlySelectedColor(): x = ' + x + ', y = ' + y + ', hex = ' + this.currentHex + ', perceived-brightness: ' + this.currentPerceivedBrightness );
}

// Uses an HTML5 Canvas to detect the color of a specific pixel in the hue picker.
function jQolor_getSelectedHueFromPixelPosition( y ) {
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.drawImage( document.getElementById('hue-slider-image'), 0, 0 );
	
	var data = context.getImageData( 0, y, 1, 1 ).data;
	
	var hex = this.jQolor( 'rgb2hex', data[0], data[1], data[2] );
	
	return hex;
}

// Calculates the hue from the y position within the red-to-blue-to-green gradient.
function jQolor_getSelectedHueFromYPosition( y ) {
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
	
	hex = this.jQolor( 'rgb2hex', r, g, b );
	
	//console.log( 'getSelectedHueFromYPosition(): y = ' + y + ', hex = ' + hex );
	
	return hex;
}

function jQolor_hex2rgb(hex) {
	if ( !hex ) {
		return {
			red:   0,
			green: 0,
			blue:  0
		}
	}
	
	if ( hex[0] == "#" ) hex = hex.substr(1);
	
	if ( hex.length == 3 ) {
		hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
	}
	
	return {
		red:   parseInt( hex.substr( 0, 2 ), 16 ),
		green: parseInt( hex.substr( 2, 2 ), 16 ),
		blue:  parseInt( hex.substr( 4, 2 ), 16 )
	}
}

function jQolor_rgb2hex( r, g, b ) {
	var hex = [ r.toString(16), g.toString(16), b.toString(16) ];

	$.each( hex,
		function( index, value ) {
			if ( value.length == 1 ) {
				hex[ index ] = '0' + value;
			}
		} );

	return hex.join('');
}

// This method lifted from Stefan Petre's color picker (www.eyecon.ro)
function jQolor_rgb2hsb( rgb ) {
	var hsb = {
		hue: 0,
		saturation: 0,
		brightness: 0
	};
	
	var min = Math.min( rgb.red, rgb.green, rgb.blue );
	var max = Math.max( rgb.red, rgb.green, rgb.blue );
	var delta = max - min;
	
	hsb.brightness = max;
	
	if ( max != 0 ) {
		hsb.saturation = 255 * delta / max;
		
		if ( rgb.red == max ) {
			hsb.hue = ( rgb.green - rgb.blue ) / delta;
		} else if ( rgb.green == max ) {
			hsb.hue = 2 + ( rgb.blue - rgb.red ) / delta;
		} else {
			hsb.hue = 4 + ( rgb.red - rgb.green ) / delta;
		}
	}
	
	hsb.hue *= 60;
	
	if ( hsb.hue < 0 ) {
		hsb.hue += 360;
	}
	
	hsb.saturation *= 100 / 255;
	hsb.brightness *= 100 / 255;

	hsb.hue =        Math.round ( hsb.hue );
	hsb.saturation = Math.round ( hsb.saturation );
	hsb.brightness = Math.round ( hsb.brightness );
	
	return hsb;
}

/* Misc jQuery util methods used by jQolor */

$.fn.onEnter =
	function( closure ) {
		$(this).keypress(
			function( event ) {
				code = event.keyCode ? event.keyCode : event.which;
			
	        	if ( code == 13 ) {
					closure.apply( this );

					return false;
	    		}
			} );
	};

$.fn.onToolClickOrDrag =
	function( clickOrDragClosure, startDragClosure, stopDragClosure ) {
		$(this).on( 'vclick', clickOrDragClosure );
		$(this).bind( 'vmousedown',
			function() {
				if ( startDragClosure != null ) {
					startDragClosure();
				}
				
				function onMoseMove( event ) {
					clickOrDragClosure( event );
					
					event.preventDefault();
				}
				
				function onMouseUp() {
					$('body').unbind( 'vmousemove', onMoseMove );
					$('body').unbind( 'vmouseup', onMouseUp );
					
					if ( stopDragClosure != null ) {
						stopDragClosure();
					}
				}
				
				$('body').bind( 'vmousemove', onMoseMove );
				$('body').bind( 'vmouseup', onMouseUp );
				
				return false;
			} );
	};

$.fn.hitTestPoint =
	function( pageX, pageY ) {
		var bounds = this.globalToLocal( pageX, pageY );

		return bounds.x >= 0 && bounds.x <= this.width() &&
		       bounds.y >= 0 && bounds.y <= this.height();
	};

$.fn.globalToLocal =
	function( pageX, pageY ) {
		var offset = this.offset();
		
		return( {
			x: Math.floor( pageX - offset.left ),
			y: Math.floor( pageY - offset.top )
		} );
	};

$.fn.localToGlobal =
	function( localX, localY ) {
		var offset = this.offset();
		
		return( {
			x: Math.floor( localX + offset.left ),
			y: Math.floor( localY + offset.top )
		} );
	};