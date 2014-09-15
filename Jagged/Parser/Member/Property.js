Class.define(

'Jagged.Parser.Member.Property',
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
	
	propertyName: {
		getter: true,
		'public setter': false,
		'private setter': true
	},
	
	'public construct : object string': function(object, propertyName)
	{
		this.set('object', object);
		this.set('propertyName', propertyName);
	},
	
	'public string replaceRetrievalScript : string string': function(script, memberName)
	{
		var matches = script.match(/[A-Za-z](?:[A-Za-z0-9-_]+)?\./);
		if (matches === null) return script;
		var propertyString = 'memberName.get(\'object\').get(memberName.get(\'propertyName\'))';
		propertyString = propertyString.replace(
			/memberName/g,
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
	
	'public getBasicState : undefined': function()
	{
		return this.get('object').get(this.get('propertyName'));
	},
	
	'public object getObject : undefined': function()
	{
		return this.get('object');
	}
	
});
