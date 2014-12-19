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
	},
	
	'static public containsElement (mixed, array) -> boolean': function(element, array)
	{
		return (array.indexOf(element) > -1);
	},
	
	'static public removeElement (mixed, array) -> array': function(element, array)
	{
		var index = array.indexOf(element);
		// @todo Throw if -1
		array.splice(index, 1);
		return array;
	},
	
	'static public toArray (object) -> array': function(object)
	{
		var array = [];
		for (var i in object) {
			if (object.hasOwnProperty(i)) array.push(object[i]);
		}
		return array;
	},
	
	'static public enumerateToArray (object) -> array': function(object)
	{
		var array = [];
		for (var i = 0; i < object.length; i++) {
			array.push(object[i]);
		}
		return array;
	},
	
	'static public inArray (mixed, array) -> boolean': function(element, array)
	{
		return (array.indexOf(element) > -1) ? true : false;
	}
	
});
