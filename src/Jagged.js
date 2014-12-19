define(

'require Jagged.Injector',
'require Jagged.ScopeHandler',
'require Jagged.Parser',
'require Jagged.Templater',

'class Jagged',
{
	
	'public construct ([string]) -> undefined': function(customNamespaces)
	{
		
		// Create an injector
		var injector = new Jagged.Injector();
		
		// Create singleton instances of
		// scope handler and parser
		injector.registerSingleton(injector.resolve('Jagged.ScopeHandler'));
		injector.registerSingleton(injector.resolve('Jagged.Parser'));
		
		// Create a templater and register
		// it as a singleton
		injector.registerSingleton(
			new Jagged.Templater(
				customNamespaces,
				injector,
				injector.resolve('Jagged.Parser')
			)
		);
		
		// Pass the templater to the scope handler.
		// This is to overcome cyclic dependencies
		// between the scope handler, parser and templater
		injector.resolve('Jagged.ScopeHandler').registerTemplater(
			injector.resolve('Jagged.Templater')
		);
		
		// Template the html element
		injector.resolve('Jagged.Templater').render(document.getElementsByTagName('html')[0]);
		
	}
	
});
