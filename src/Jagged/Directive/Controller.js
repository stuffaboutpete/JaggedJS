define(

'require Jagged.IDirective',
'require Jagged.Parser',
'require Jagged.Parser.Member.Property',
'require Jagged.Parser.Member.Method',
'require Jagged.Injector',
'require Jagged.Templater',
'require Jagged.ScopeHandler',

'class Jagged.Directive.Controller implements Jagged.IDirective',
{
	
	'private controller (Jagged.Directive.Controller.IController)': null,
	'private element (HTMLElement)': null,
	'private injector (Jagged.Injector)': null,
	'private templater (Jagged.Templater)': null,
	'private scopeHandler (Jagged.ScopeHandler)': null,
	
	'public construct (Jagged.Injector, Jagged.Templater, Jagged.ScopeHandler) -> undefined': function(injector, templater, scopeHandler)
	{
		this.injector(injector);
		this.templater(templater);
		this.scopeHandler(scopeHandler);
	},
	
	'public initialise (object, string) -> undefined': function(element, value)
	{
		this.element(element);
		this.templater().pause(this);
		require(value, 'controllerClassLoaded');
	},
	
	'private controllerClassLoaded (string) -> undefined': function(controllerClass)
	{
		var controller = this.createController(controllerClass)
		this.controller(controller);
		var propertiesAndMethods = {};
		var reflectionClass = new Reflection.Class(controllerClass);
		var reflectionProperties = reflectionClass.getProperties();
		var reflectionMethods = reflectionClass.getMethods();
		for (var i in reflectionProperties) {
			var name = reflectionProperties[i].getName();
			propertiesAndMethods[name] = new Jagged.Parser.Member.Property(controller, name);
		}
		for (var i in reflectionMethods) {
			var name = reflectionMethods[i].getName();
			propertiesAndMethods[name] = new Jagged.Parser.Member.Method(controller, name);
		}
		this.scopeHandler().registerProperties(this.element(), propertiesAndMethods);
		this.templater().unPause(this);
	},
	
	'private createController (string) -> object': function(controllerClass)
	{
		var controller = this.injector().resolve(controllerClass);
		if (!controller.conformsTo('Jagged.Directive.Controller.IController')) {
			throw new Error(
				'Controller is not an instance of Jagged.Directive.Controller.IController ' +
				'(Controller class: ' + classParts.join('.') + ')'
			);
		}
		return controller;
	}
	
});
