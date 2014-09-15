Class.define(

'Jagged.Helper.String',
{
	
	'static public string uppercaseFirst : string': function(string)
	{
		return string.charAt(0).toUpperCase() + string.slice(1);
	},
	
	'static public string underscoreToPascalCasing : string': function(string)
	{
		var parts = string.split('_');
		for (var i = 0; i < parts.length; i++) {
			parts[i] = Jagged.Helper.String.uppercaseFirst(parts[i]);
		}
		return parts.join('');
	},
	
	'static public string hyphenToPascalCasing : string': function(string)
	{
		var parts = string.split('-');
		for (var i = 0; i < parts.length; i++) {
			parts[i] = Jagged.Helper.String.uppercaseFirst(parts[i]);
		}
		return parts.join('');
	},
	
	'static public string pascalToHyphenCasing : string': function(string)
	{
		var parts = [];
		var currentString = '';
		for (var i = 0; i < string.length; i++) {
			if (string[i].match(/[A-Z]/)) {
				if (currentString != '') {
					parts.push(currentString);
					currentString = '';
				}
			}
			currentString += string[i].toLowerCase();
		}
		parts.push(currentString);
		return parts.join('-');
	}
	
});
