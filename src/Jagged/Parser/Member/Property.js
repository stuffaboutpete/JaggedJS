define(

'require Jagged.Parser.Member',

'class Jagged.Parser.Member.Property extends Jagged.Parser.Member',
{
	
	'public replaceRetrievalScript (string, string) -> string': function(script, memberName)
	{
		var matches = script.match(/[A-Za-z](?:[A-Za-z0-9-_]+)?\./);
		if (matches === null) return script;
		var propertyString = 'placeholder.get(\'object\').get(placeholder.get(\'memberName\'))';
		propertyString = propertyString.replace(
			/placeholder/g,
			memberName
		);
		for (var i = 0; i < matches.length; i++) {
			script = script.replace(
				matches[i],
				propertyString + '.'
			);
		}
		return script;
	},
	
	'public getBasicState () -> mixed': function()
	{
		return this.object().get(this.memberName());
	}
	
});
