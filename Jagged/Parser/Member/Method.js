Class.define(

'Jagged.Parser.Member.Method',
{
	
	Require: [
		'Jagged.Parser.IMember'
	],
	
	Implements: 'Jagged.Parser.IMember',
	
	object: {
		getter: true,
		'public setter': false,
		'private setter': true
	},
	
	methodName: {
		getter: true,
		'public setter': false,
		'private setter': true
	},
	
	'public construct : object string': function(object, methodName)
	{
		this.set('object', object);
		this.set('methodName', methodName);
	},
	
	'public string replaceRetrievalScript : string string': function(script, memberName)
	{
		var matches = script.match(/[A-Za-z](?:[A-Za-z0-9-_]+)?\(/);
		if (matches === null) return script;
		var methodString = 'memberName.get(\'object\')[memberName.get(\'methodName\')]'.replace(
			/memberName/g,
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
	
	'public getBasicState : undefined': function()
	{
		return this.get('object')[this.get('propertyName')]();
	},
	
	'public object getObject : undefined': function()
	{
		return this.get('object');
	}
	
});
