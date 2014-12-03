define(

'require Jagged.Initialiser',
'require Jagged.Injector',
'require Jagged.ScopeHandler',
'require Jagged.Parser',
'require Jagged.Templater',

'class Jagged',
{
	
	'public construct ([string]) -> undefined': function(customNamespaces)
	{
		
		var injector = new Jagged.Injector();
		
		injector.registerSingleton(injector.resolve('Jagged.ScopeHandler'));
		injector.registerSingleton(injector.resolve('Jagged.Parser'));
		injector.registerSingleton(injector.resolve('Jagged.Templater'));
		injector.resolve('Jagged.ScopeHandler').registerTemplater(
			injector.resolve('Jagged.Templater')
		);
		
		new Jagged.Initialiser(customNamespaces, injector);
		
	}
	
});
