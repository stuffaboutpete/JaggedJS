define(

'require Jagged.Helper.Array',
'require Jagged.Parser.Member',

'class Jagged.Parser',
{
	
	'private scopeHandler (Jagged.ScopeHandler)': null,
	
	'public construct (Jagged.ScopeHandler) -> undefined': function(scopeHandler)
	{
		this.scopeHandler(scopeHandler);
	},
	
	'public parse (string, object) -> mixed': function(script, element)
	{
		var scopeObject = this.scopeHandler().getScopeObject(element);
		var originalValues = {};
		return (function(parser){
			for (var i in scopeObject) {
				if (typeof this[i] != 'undefined') originalValues[i] = this[i];
				this[i] = scopeObject[i];
			}
			for (var i in scopeObject) {
				var variableMatches = script.match(new RegExp(i));
				if (variableMatches === null) continue;
				for (var j = 0; j < variableMatches.length; j++) {
					try {
						var output = eval(variableMatches[j]);
					} catch (error) {
						continue;
					}
					if (!(output instanceof Jagged.Parser.Member)) continue;
					script = output.replaceRetrievalScript(script, variableMatches[j]);
				}
			}
			var output = eval(script);
			if (output instanceof Jagged.Parser.Member) {
				output = output.getBasicState();
			}
			for (var i in scopeObject) {
				delete(this[i]);
				if (typeof originalValues[i] != 'undefined') this[i] = originalValues[i];
			}
			return output;
		})(this);
	}
	
});
