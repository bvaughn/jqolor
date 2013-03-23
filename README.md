jQolor is a JavaScript color picker built on top of jQuery (1.9.1) and Bootstrap. You'll need to include both of those components before including jQolor.

Next you'll need to define an input to be decorated with a color-picker.
<input id="my-color-picker" name="my-color-picker" />

Lastly, once your document has loaded you can initialize jQolor like this:
var myColorPicker = $('#my-color-picker').jQolor( { color : '1C72B5' } );
myColorPicker.bind( 'colorChange',
	function( event, data ) {
		// data keys: hex, red, green, blue, hue, saturation, brightness
	} );

Try out jQolor online here:
http://apps.briandavidvaughn.com/js/color-picker/