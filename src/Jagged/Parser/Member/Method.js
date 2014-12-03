define(

'require Jagged.Parser.Member',

'class Jagged.Parser.Member.Method extends Jagged.Parser.Member',
{
	
	'public replaceRetrievalScript (string, string) -> string': function(script, memberName)
	{
		var matches = script.match(/[A-Za-z](?:[A-Za-z0-9-_]+)?\(/);
		if (matches === null) return script;
		var methodString = 'placeholder.get(\'object\')[placeholder.get(\'memberName\')]'.replace(
			/placeholder/g,
			memberName
		);
		for (var i = 0; i < matches.length; i++) {
			script = script.replace(
				matches[i],
				methodString + '('
			);
		}
		return script;
	},
	
	'public getBasicState () -> mixed': function()
	{
		return this.object()[this.memberName()]();
	}
	
});
