Class.define(

'Jagged.Directive.Model',
{
	
	Require: [
		'Jagged.IDirective',
		'/scripts/Jagged/vendor/jquery-1.11.1.min.js'
	],
	
	Implements: 'Jagged.IDirective',
	
	'private parser': undefined,
	'private scopeHandler': undefined,
	'private templater': undefined,
	'private element': undefined,
	
	'public construct : Jagged.Parser Jagged.ScopeHandler Jagged.Templater': function(parser, scopeHandler, templater)
	{
		this.set('parser', parser);
		this.set('scopeHandler', scopeHandler);
		this.set('templater', templater);
	},
	
	'public undefined initialise : object string': function(element, value)
	{
		this.set('element', element);
		var scopeHandler = this.get('scopeHandler');
		var scopeElement = this.getScopeElement(element);
		var properties = {};
		properties[value] = element.value;
		scopeHandler.registerProperties(scopeElement, properties);
		scopeHandler.bind('objectChanged', 'objectChanged');
		var templater = this.get('templater');
		$(element).on('input', function(){
			properties[value] = $(this).val();
			templater.render(scopeElement);
		});
	},
	
	'private object getScopeElement : object': function(element)
	{
		var $currentElement = $(element);
		do {
			if (typeof $parentElement != 'undefined') $currentElement = $parentElement;
			if ($currentElement.attr('jagged.directive.controller')) break;
			$parentElement = $currentElement.parent();
		} while ($parentElement[0] !== document);
		return $currentElement[0];
	},
	
	'public undefined objectChanged : string object': function(propertyName, object)
	{
		this.get('templater').render(this.get('element'));
	}
	
});
