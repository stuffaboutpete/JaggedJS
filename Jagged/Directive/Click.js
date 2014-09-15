Class.define(

'Jagged.Directive.Click',
{
	
	Require: [
		'Jagged.IDirective',
		'/scripts/Jagged/vendor/jquery-1.11.1.min.js'
	],
	
	Implements: 'Jagged.IDirective',
	
	'private parser': undefined,
	'private scopeHandler': undefined,
	
	'public construct : Jagged.Parser Jagged.ScopeHandler Jagged.Templater': function(parser, scopeHandler, templater)
	{
		this.set('parser', parser);
		this.set('scopeHandler', scopeHandler);
	},
	
	'public undefined initialise : object string': function(element, value)
	{
		var parser = this.get('parser');
		$(element).on('click', function(){
			parser.parse(value, element);
		});
	}
	
});
