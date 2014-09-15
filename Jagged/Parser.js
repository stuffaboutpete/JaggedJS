Class.define(

'Jagged.Parser',
{
	
	Require: [
		'Jagged.Helper.Array',
		'Jagged.Parser.IMember'
	],
	
	'private scopeHandler': null,
	
	'public construct : Jagged.ScopeHandler': function(scopeHandler)
	{
		this.set('scopeHandler', scopeHandler);
	},
	
	'public parse : string object': function(script, element)
	{
		var scopeObject = this.get('scopeHandler').getScopeObject(element);
		var originalValues = {};
		var output = (function(parser){
			for (var i in scopeObject) {
				if (!scopeObject.hasOwnProperty(i)) continue;
				if (typeof this[i] != 'undefined') originalValues[i] = this[i];
				this[i] = scopeObject[i];
			}
			for (var i in scopeObject) {
				if (!scopeObject.hasOwnProperty(i)) continue;
				var variableMatches = script.match(new RegExp(i));
				if (variableMatches === null) continue;
				for (var j = 0; j < variableMatches.length; j++) {
					try {
						var output = eval(variableMatches[j]);
					} catch (error) {
						continue;
					}
					if (!output.instanceOf('Jagged.Parser.IMember')) continue;
					script = output.replaceRetrievalScript(script, variableMatches[j]);
				}
			}
			var output = eval(script);
			if (typeof output != 'undefined' && output.instanceOf('Jagged.Parser.IMember')) {
				output = output.getBasicState();
			}
			for (var i in scopeObject) {
				if (!scopeObject.hasOwnProperty(i)) continue;
				delete(this[i]);
				if (typeof originalValues[i] != 'undefined') this[i] = originalValues[i];
			}
			return output;
		})(this);
		return output;
	}
	
});
