Class.define(

'Jagged',
{
	
	Require: [
		'Jagged.Initialiser',
		'Jagged.Injector',
		'Jagged.ScopeHandler',
		'Jagged.Parser',
		'Jagged.Templater'
	],
	
	'public construct : [string]': function(customNamespaces)
	{
		
		var injector = new Jagged.Injector();
		
		injector.registerSingleton(injector.resolve('Jagged.ScopeHandler'));
		injector.registerSingleton(injector.resolve('Jagged.Parser'));
		injector.registerSingleton(injector.resolve('Jagged.Templater'));
		
		new Jagged.Initialiser(customNamespaces, injector);
		
	}
	
});
