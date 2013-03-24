jQolor is a JavaScript color picker built on top of [jQuery (1.9.1)](http://jquery.com/download/) and [Bootstrap](http://twitter.github.com/bootstrap/).

<h4>Step 1</h4>
You'll need to include both of those components before including jQolor.

```html
<link rel="stylesheet" type="text/css" href="//twitter.github.com/bootstrap/assets/css/bootstrap.css" />
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js" ></script>
```

<h4>Step 2</h4>
Next you'll need to define an input to be decorated with a color-picker.
```html
<input id="my-color-picker" name="my-color-picker" />
```

<h4>Step 3</h4>
Lastly, once your document has loaded you can initialize jQolor like this:
```javascript
var myColorPicker = $('#my-color-picker').jQolor( { color : '1C72B5' } );
myColorPicker.bind( 'colorChange',
	function( event, data ) {
		// data attributes: hex, red, green, blue, hue, saturation, brightness
	} );
```

Try the online jQolor demo here:
http://apps.briandavidvaughn.com/js/color-picker/
