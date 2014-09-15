module('Jagged.Injector Tests');

QUnit.testStart(function(){
	delete window.JaggedTest;
	Class.define('JaggedTest.SimpleClass', {});
	Class.define('JaggedTest.SingleDependency', {
		'public simpleObject': null,
		'public construct : JaggedTest.SimpleClass': function(simpleObject){
			this.set('simpleObject', simpleObject);
		}
	});
	Class.define('JaggedTest.MultipleDependencies', {
		'public arguments': null,
		'public construct : JaggedTest.SimpleClass JaggedTest.SimpleClass': function(){
			this.set('arguments', arguments);
		}
	});
	Class.define('JaggedTest.NestedDependencies', {
		'public object': null,
		'public construct : JaggedTest.MultipleDependencies': function(object){
			this.set('object', object);
		}
	});
});

test('Injector can be instanciated', function(){
	var injector = new Jagged.Injector();
	ok(injector.instanceOf(Jagged.Injector));
});

test('Object can be resolved through injector', function(){
	var injector = new Jagged.Injector();
	ok(injector.resolve('JaggedTest.SimpleClass').instanceOf(JaggedTest.SimpleClass));
});

test('Single dependency is provided to object', function(){
	var injector = new Jagged.Injector();
	var myObject = injector.resolve('JaggedTest.SingleDependency');
	ok(myObject.instanceOf(JaggedTest.SingleDependency));
	ok(myObject.get('simpleObject').instanceOf(JaggedTest.SimpleClass));
});

test('Multiple dependencies are provided to object', function(){
	var injector = new Jagged.Injector();
	var myObject = injector.resolve('JaggedTest.MultipleDependencies');
	ok(myObject.instanceOf(JaggedTest.MultipleDependencies));
	ok(myObject.get('arguments')[0].instanceOf(JaggedTest.SimpleClass));
	ok(myObject.get('arguments')[1].instanceOf(JaggedTest.SimpleClass));
});

test('Nested dependecies are injected', function(){
	var injector = new Jagged.Injector();
	var myObject = injector.resolve('JaggedTest.NestedDependencies');
	ok(myObject.instanceOf(JaggedTest.NestedDependencies));
	ok(myObject.get('object').instanceOf(JaggedTest.MultipleDependencies));
	ok(myObject.get('object').get('arguments')[0].instanceOf(JaggedTest.SimpleClass));
	ok(myObject.get('object').get('arguments')[1].instanceOf(JaggedTest.SimpleClass));
});

test('Singleton can be registered and it is used in future resolves', function(){
	var injector = new Jagged.Injector();
	var simpleObject = new JaggedTest.SimpleClass();
	injector.registerSingleton(simpleObject);
	ok(injector.resolve('JaggedTest.SimpleClass') === simpleObject);
});

test('Singleton is used as dependency in resolve', function(){
	var injector = new Jagged.Injector();
	var simpleObject = new JaggedTest.SimpleClass();
	injector.registerSingleton(simpleObject);
	var myObject = injector.resolve('JaggedTest.SingleDependency');
	ok(myObject.get('simpleObject') === simpleObject);
});

/**
 * Should
 * 
 *	Be able to resolve an object
 *	Objects dependency should be injected
 *	Objects multiple dependencies should be injected
 *	Nested dependencies should be injected
 * Can pass in one dependency and inject others
 * Can pass in nested dependency
 *	Can register singleton which is returned when class is resolved
 * Singleton is also used for dependencies
 * Singleton cannot be replaced
 * Interface implementation can be registered and is used when interface is resolved
 * Interface implementation is also used for dependencies
 * Interface implementation must actually be of that interface
 * Object method can be called through injector and its dependencies will be resolved
 * Object method downstream dependencies are injected
 * All the same again with object method...
 * Injector uses itself as a singleton
 */
