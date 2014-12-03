define(

'class Jagged.Helper.Array',
{
	
	'static public isArray (array) -> boolean': function(array)
	{
		return Object.prototype.toString.call(array) == '[object Array]';
	},
	
	'static public removeDuplicates (array) -> array': function(array)
	{
		// http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
		return array.filter(function(element, position, self) {
			return self.indexOf(element) == position;
		});
	}
	
});
