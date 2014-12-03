define(

'require Jagged.IDirective',
'require jQuery',

'class Jagged.Directive.Click implements Jagged.IDirective',
{
	
	'private parser (Jagged.Parser)': null,
	
	'public construct (Jagged.Parser) -> undefined': function(parser)
	{
		this.parser(parser);
	},
	
	'public initialise (object, string) -> undefined': function(element, value)
	{
		$(element).on('click', function(){
			this.parser().parse(value, element);
		}.bind(this));
	}
	
});
