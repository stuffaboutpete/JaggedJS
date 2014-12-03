define(

'class Jagged.Injector',
{
	
	'private singletons ([object])': [],
	
	'public resolve (string) -> object': function(className)
	{
		var classFunction = this.getClassFromClassName(className);
		if (this.hasSingleton(className)) return this.getSingleton(className);
		var dependencyTypes = this.getDependencyTypesFromClass(className);
		var dependencies = this.getDependenciesFromDependencyTypes(dependencyTypes);
		dependencies.unshift(undefined);
		return new (classFunction.bind.apply(classFunction, dependencies))();
	},
	
	'public registerSingleton (object) -> undefined': function(object)
	{
		var match = object.toString().match(/\[object ([\w.]+)\]/);
		this.get('singletons').push({
			className: match[1],
			object: object
		});
	},
	
	'private getClassFromClassName (string) -> function': function(className)
	{
		var classParts = className.split('.');
		var classFunction = window;
		for (var i = 0; i < classParts.length; i++) {
			classFunction = classFunction[classParts[i]];
		}
		return classFunction;
	},
	
	'private getDependencyTypesFromClass (string) -> array': function(className)
	{
		var reflectionMethods = (new Reflection.Class(className)).getMethods();
		var constructorMethods = [];
		for (var i in reflectionMethods) {
			if (reflectionMethods[i].getName() == 'construct') {
				constructorMethods.push(reflectionMethods[i]);
			}
		}
		var argumentTypes;
		for (var i in constructorMethods) {
			var methodArgumentTypes = constructorMethods[i].getArguments();
			if (typeof argumentTypes == 'undefined'
			||	methodArgumentTypes.length < argumentTypes.length) {
				argumentTypes = [];
				for (var j in methodArgumentTypes) {
					argumentTypes.push(methodArgumentTypes[j].getIdentifier());
				}
			}
		}
		return argumentTypes || [];
		// if (typeof classFunction.methods == 'undefined') return [];
		// if (typeof classFunction.methods.construct == 'undefined') return [];
		// return classFunction.methods.construct.argTypes;
	},
	
	'private getDependenciesFromDependencyTypes (array) -> array': function(dependencyTypes)
	{
		var dependencies = [];
		for (var i in dependencyTypes) {
			if (!dependencyTypes.hasOwnProperty(i)) continue;
			dependencies.push(this.resolve(dependencyTypes[i]));
		}
		return dependencies;
	},
	
	'private hasSingleton (string) -> boolean': function(className)
	{
		var singletons = this.get('singletons');
		for (var i in singletons) {
			if (!singletons.hasOwnProperty(i)) continue;
			if (singletons[i].className == className) return true;
		}
		return false;
	},
	
	'private getSingleton (string) -> object': function(className)
	{
		var singletons = this.get('singletons');
		for (var i in singletons) {
			if (!singletons.hasOwnProperty(i)) continue;
			if (singletons[i].className == className) return singletons[i].object;
		}
	}
	
});
