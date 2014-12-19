define(

'require Jagged.IDirective',
'require jQuery',

'class Jagged.Directive.Model implements Jagged.IDirective',
{
	
	'private parser (Jagged.Parser)': null,
	'private scopeHandler (Jagged.ScopeHandler)': null,
	'private templater (Jagged.Templater)': null,
	'private element (HTMLElement)': null,
	'private modelName (string)': null,
	
	'public construct (Jagged.Parser, Jagged.ScopeHandler, Jagged.Templater) -> undefined': function(parser, scopeHandler, templater)
	{
		this.parser(parser);
		this.scopeHandler(scopeHandler);
		this.templater(templater);
	},
	
	'public initialise (object, string) -> undefined': function(element, value)
	{
		
		// Save the arguments
		this.element(element);
		this.modelName(value);
		
		// Get the element that we should
		// record the model against in the DOM
		var scopeElement = this.getScopeElement(element);
		
		// Register the scope element against the
		// model name and value in the scope handler
		this.scopeHandler().registerProperties(
			scopeElement,
			this.getPropertiesObject(element.value)
		);
		
		// Bind to the element changing, so that
		// we can update the model value
		$(element).on('input', function(){
			
			// Register a new value with
			// the scope handler
			this.scopeHandler().registerProperties(
				scopeElement,
				this.getPropertiesObject($(element).val())
			);
			
		}.bind(this));
		
	},
	
	'private getPropertiesObject (string) -> object': function(value)
	{
		// Create a new object containing
		// only the model name as the key
		// against the model value
		var properties = {};
		properties[this.modelName()] = value;
		return properties;
	},
	
	'private getScopeElement (object) -> object': function(element)
	{
		// Return either the first ancestor
		// which has a controller directive
		// or the document html element
		var $currentElement = $(element);
		var $parentElement;
		do {
			if (typeof $parentElement != 'undefined') $currentElement = $parentElement;
			if ($currentElement.attr('jagged.directive.controller')) break;
			$parentElement = $currentElement.parent();
		} while ($parentElement[0] !== document);
		return $currentElement[0];
	}
	
});
