Class.define(

'Jagged.Directive.Controller',
{
	
	Require: [
		'Jagged.IDirective',
		'Jagged.Parser',
		'Jagged.Parser.Member.Property',
		'Jagged.Parser.Member.Method'
	],
	
	Implements: 'Jagged.IDirective',
	
	'private controller': null,
	'private element': null,
	'private parser': null,
	'private scopeHandler': null,
	
	'public construct : Jagged.Parser Jagged.ScopeHandler': function(parser, scopeHandler)
	{
		this.set('parser', parser);
		this.set('scopeHandler', scopeHandler);
	},
	
	'public undefined initialise : object string': function(element, value)
	{
		this.set('element', element);
		Class.require(value, 'controllerClassLoaded');
	},
	
	'private undefined controllerClassLoaded : string': function(controllerClass)
	{
		var controller = this.createController(controllerClass)
		this.set('controller', controller);
		var propertiesAndMethods = {};
		for (var i in controller.properties) {
			if (!controller.properties.hasOwnProperty(i)) continue;
			propertiesAndMethods[i] = new Jagged.Parser.Member.Property(controller, i);
		}
		for (var i in controller.type.methods) {
			if (!controller.type.methods.hasOwnProperty(i)) continue;
			propertiesAndMethods[i] = new Jagged.Parser.Member.Method(controller, i);
		}
		this.get('scopeHandler').registerProperties(this.get('element'), propertiesAndMethods);
	},
	
	'private object createController : string': function(controllerClass)
	{
		var classParts = controllerClass.split('.');
		var controllerClass = window;
		for (var i = 0; i < classParts.length; i++) {
			controllerClass = controllerClass[classParts[i]];
		}
		var controller = new controllerClass();
		if (!controller.instanceOf('Jagged.Directive.Controller.IController')) {
			throw new Error(
				'Controller is not an instance of Jagged.Directive.Controller.IController ' +
				'(Controller class: ' + classParts.join('.') + ')'
			);
		}
		return controller;
	}
	
});
