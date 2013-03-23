function hex2rgb(hex) {
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

function rgb2hex( r, g, b ) {
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
function rgb2hsb( rgb ) {
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