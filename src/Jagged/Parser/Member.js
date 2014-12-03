define(

'abstract class Jagged.Parser.Member',
{
	
	'abstract public getBasicState () -> mixed': undefined,
	'abstract public replaceRetrievalScript (string, string) -> string': undefined,
	
	'private object (object)': null,
	'private memberName (string)': null,
	
	'public construct (object, string) -> undefined': function(object, memberName)
	{
		this.object(object);
		this.memberName(memberName);
		object.bind('change', 'objectChangedHandler');
	},
	
	'public getObject () -> object': function()
	{
		return this.object();
	},
	
	'private objectChangedHandler (string, object) -> undefined': function(methodName, object)
	{
		if (methodName == this.memberName()) this.trigger('change', [methodName, object]);
	}
	
});
