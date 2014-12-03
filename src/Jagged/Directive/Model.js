define(

'require Jagged.IDirective',
'require jQuery',

'class Jagged.Directive.Model implements Jagged.IDirective',
{
	
	'private parser (Jagged.Parser)': null,
	'private scopeHandler (Jagged.ScopeHandler)': null,
	'private templater (Jagged.Templater)': null,
	'private element (HTMLElement)': null,
	
	'public construct (Jagged.Parser, Jagged.ScopeHandler, Jagged.Templater) -> undefined': function(parser, scopeHandler, templater)
	{
		this.parser(parser);
		this.scopeHandler(scopeHandler);
		this.templater(templater);
	},
	
	'public initialise (object, string) -> undefined': function(element, value)
	{
		this.element(element);
		var scopeElement = this.getScopeElement(element);
		var properties = {};
		properties[value] = element.value;
		this.scopeHandler().registerProperties(scopeElement, properties);
		this.scopeHandler().bind('objectChanged', 'objectChanged');
		var templater = this.templater();
		$(element).on('input', function(){
			properties[value] = $(this).val();
			templater.render(scopeElement);
		});
	},
	
	'private getScopeElement (object) -> object': function(element)
	{
		var $currentElement = $(element);
		var $parentElement;
		do {
			if (typeof $parentElement != 'undefined') $currentElement = $parentElement;
			if ($currentElement.attr('jagged.directive.controller')) break;
			$parentElement = $currentElement.parent();
		} while ($parentElement[0] !== document);
		return $currentElement[0];
	},
	
	'public objectChanged (string, object) -> undefined': function(propertyName, object)
	{
		this.templater().render(this.element());
	}
	
});
