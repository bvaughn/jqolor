<strong>jQolor</strong> is a JavaScript color picker built on top of jQuery (1.9.1) and Bootstrap. You'll need to include both of those components before including <strong>jQolor</strong>.

Next you'll need to define an input to be decorated with a color-picker.
```html
<input id="my-color-picker" name="my-color-picker" />
```

Lastly, once your document has loaded you can initialize jQolor like this:
```javascript
var myColorPicker = $('#my-color-picker').jQolor( { color : '1C72B5' } );
myColorPicker.bind( 'colorChange',
	function( event, data ) {
		// data keys: hex, red, green, blue, hue, saturation, brightness
	} );
```

Try out <strong>jQolor</strong> online here:
http://apps.briandavidvaughn.com/js/color-picker/