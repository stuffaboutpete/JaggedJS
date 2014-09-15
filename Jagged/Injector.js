Class.define(

'Jagged.Injector',
{
	
	'private singletons': [],
	
	'public resolve : string': function(className)
	{
		var classFunction = this.getClassFromClassName(className);
		if (this.hasSingleton(className)) return this.getSingleton(className);
		var dependencyTypes = this.getDependencyTypesFromClass(classFunction);
		var dependencies = this.getDependeciesFromDependencyTypes(dependencyTypes);
		dependencies.unshift(undefined);
		return new (classFunction.bind.apply(classFunction, dependencies))();
	},
	
	'public undefined registerSingleton : Class': function(object)
	{
		var match = object.parent.toString().match(/\[object ([\w.]+)\]/);
		this.get('singletons').push({
			className: match[1],
			object: object
		});
	},
	
	'private function getClassFromClassName : string': function(className)
	{
		var classParts = className.split('.');
		var classFunction = window;
		for (var i = 0; i < classParts.length; i++) {
			classFunction = classFunction[classParts[i]];
		}
		return classFunction;
	},
	
	'private array getDependencyTypesFromClass : function': function(classFunction)
	{
		if (typeof classFunction.methods == 'undefined') return [];
		if (typeof classFunction.methods.construct == 'undefined') return [];
		return classFunction.methods.construct.argTypes;
	},
	
	'private array getDependeciesFromDependencyTypes : array': function(dependencyTypes)
	{
		var dependencies = [];
		for (var i in dependencyTypes) {
			if (!dependencyTypes.hasOwnProperty(i)) continue;
			dependencies.push(this.resolve(dependencyTypes[i]));
		}
		return dependencies;
	},
	
	'private boolean hasSingleton : string': function(className)
	{
		var singletons = this.get('singletons');
		for (var i in singletons) {
			if (!singletons.hasOwnProperty(i)) continue;
			if (singletons[i].className == className) return true;
		}
		return false;
	},
	
	'private object getSingleton : string': function(className)
	{
		var singletons = this.get('singletons');
		for (var i in singletons) {
			if (!singletons.hasOwnProperty(i)) continue;
			if (singletons[i].className == className) return singletons[i].object;
		}
	}
	
});
