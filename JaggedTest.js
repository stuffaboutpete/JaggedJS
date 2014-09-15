module('Jagged Root Tests');

QUnit.testStart(function(){
	$('#sandbox').remove();
	$('body').append($('<div />').attr('id', 'sandbox'));
	delete window.My;
	Class.define('Jagged.Directive.One', {
		Implements: 'Jagged.IDirective',
		'undefined initialise : object string': function(element, attributeValue){
			My.Directive.One.hasRun = true;
		}
	});
	Class.registerLoadedClass('Jagged.Directive.One');
});

test('Jagged can be instanciated with empty array', function(){
	var jagged = new Jagged([]);
	ok(jagged.instanceOf(Jagged));
});

test('Jagged can be instanciated with array of namespaces', function(){
	var jagged = new Jagged(['My']);
	ok(jagged.instanceOf(Jagged));
});

test('something happens', function(){
	$('#sandbox').append($('<div />').attr('jagged.directive.one', 'value'));
	jagged = new Jagged(['My']);
	ok(Jagged.Directive.One.hasRun);
});

/**
 * Should
 * 
 * Inspect page for any attributes that match Jagged.Directive.Summet
 * change-case to ChangeCase
 * Look for a class of that type
 * Ensure they're instances of IDirective
 * Initialise directive
 * Pass object and value of attribute
 * Pass empty string if required
 * Accept array of other namespaces to look for and run directives of these types
 * 
 */