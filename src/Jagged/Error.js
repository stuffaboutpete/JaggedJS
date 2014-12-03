define(

'class Jagged.Error extends Error',
{
	
	'abstract protected getName () -> string': undefined,
	'abstract protected getMessageFromCode (number) -> string': undefined,
	
	'private extraInformation (string)': null,
	'private code (number)': null,
	
	'public construct (number, string) -> undefined': function(code, extraInformation)
	{
		this.extraInformation(extraInformation);
		this.construct(code);
	},
	
	'public construct (number) -> undefined': function(code)
	{
		this.code(code);
		this.stack = Error().stack;
	},
	
	'public toString () -> string': function()
	{
		var message = this.getMessageFromCode(this.code());
		if (typeof this.extraInformation() !== null) {
			message += ' (' + this.extraInformation() + ')';
		}
		return this.getName() + ': ' + message;
	},
	
	'public getCode () -> number': function()
	{
		return this.code();
	}
	
});
