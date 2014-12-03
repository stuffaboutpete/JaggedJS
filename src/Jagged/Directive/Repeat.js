define(

'require Jagged.IDirective',
'require Jagged.Templater',

'class Jagged.Directive.Repeat implements Jagged.IDirective',
{
	
	'private parser (Jagged.Parser)': null,
	'private scopeHandler (Jagged.ScopeHandler)': null,
	'private templater (Jagged.Templater)': null,
	'private array (array)': null,
	'private itemName (string)': null,
	'private originalElement (HTMLElement)': null,
	'private parentElement (HTMLElement)': null,
	'private currentClonedElements ([HTMLElement])': [],
	
	'public construct (Jagged.Parser, Jagged.ScopeHandler, Jagged.Templater) -> undefined': function(parser, scopeHandler, templater)
	{
		this.parser(parser);
		this.scopeHandler(scopeHandler);
		this.templater(templater);
	},
	
	'public initialise (object, string) -> undefined': function(element, value)
	{
		this.originalElement(element);
		this.parentElement(element.parentNode);
		var match = value.match(/^([^\s]+) in ([^\s]+)$/);
		if (!match) {
			throw new Error(
				'Attribute value passed to repeat directive ' +
				'must be of the format \'item in array\''
			);
		}
		this.itemName(match[1]);
		// @todo Check is array
		// @todo Handle object as well
		this.array(this.parser().parse(match[2], element));
		element.parentNode.removeChild(element);
		this.updateListElements();
		this.scopeHandler().bind('objectChanged', 'objectChanged');
	},
	
	'private updateListElements () -> undefined': function()
	{
		var array = this.array();
		var itemName = this.itemName();
		var originalElement = this.originalElement();
		var parentElement = this.parentElement();
		var currentClonedElements = this.currentClonedElements();
		for (var i in currentClonedElements) parentElement.removeChild(currentClonedElements[i]);
		currentClonedElements = [];
		for (var i = 0; i < array.length; i++) {
			var clone = originalElement.cloneNode(true);
			currentClonedElements.push(clone);
			var properties = {};
			properties[itemName] = array[i];
			parentElement.appendChild(clone);
			this.scopeHandler().registerProperties(clone, properties);
		}
		this.currentClonedElements(currentClonedElements);
	},
	
	'public objectChanged (string, object) -> undefined': function(propertyName, object)
	{
		if (this.array() !== object.get(propertyName)) return;
		this.updateListElements();
	}
	
});
