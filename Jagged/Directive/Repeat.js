Class.define(

'Jagged.Directive.Repeat',
{
	
	Require: [
		'Jagged.IDirective',
		'Jagged.Templater'
	],
	
	Implements: 'Jagged.IDirective',
	
	'private parser': null,
	'private scopeHandler': null,
	'private templater': null,
	'private array': null,
	'private itemName': null,
	'private originalElement': null,
	'private parentElement': null,
	'private currentClonedElements': [],
	
	'public construct : Jagged.Parser Jagged.ScopeHandler Jagged.Templater': function(parser, scopeHandler, templater)
	{
		this.set('parser', parser);
		this.set('scopeHandler', scopeHandler);
		this.set('templater', templater);
	},
	
	'public undefined initialise : object string': function(element, value)
	{
		this.set('originalElement', element);
		this.set('parentElement', element.parentNode);
		var match = value.match(/^([^\s]+) in ([^\s]+)$/);
		if (!match) {
			throw new Error(
				'Attribute value passed to repeat directive ' +
				'must be of the format \'item in array\''
			);
		}
		this.set('itemName', match[1]);
		var parser = this.get('parser');
		var array = parser.parse(match[2], element);
		// @todo Check is array
		// @todo Handle object as well
		this.set('array', array);
		element.parentNode.removeChild(element);
		this.updateListElements();
		this.get('scopeHandler').bind('objectChanged', 'objectChanged');
	},
	
	'private undefined updateListElements : undefined': function()
	{
		var array = this.get('array');
		var itemName = this.get('itemName');
		var originalElement = this.get('originalElement');
		var parentElement = this.get('parentElement');
		var currentClonedElements = this.get('currentClonedElements');
		for (var i in currentClonedElements) {
			if (!currentClonedElements.hasOwnProperty(i)) continue;
			parentElement.removeChild(currentClonedElements[i]);
		}
		currentClonedElements = [];
		for (var i = 0; i < array.length; i++) {
			var clone = originalElement.cloneNode(true);
			currentClonedElements.push(clone);
			var properties = {};
			properties[itemName] = array[i];
			this.get('scopeHandler').registerProperties(clone, properties);
			this.get('parentElement').appendChild(clone);
		}
		this.set('currentClonedElements', currentClonedElements);
		this.get('templater').render(parentElement);
	},
	
	'public undefined objectChanged : string object': function(propertyName, object)
	{
		if (this.get('array') !== object.get(propertyName)) return;
		this.updateListElements();
	}
	
});
