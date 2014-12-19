define(

'require Jagged.IDirective',
'require Jagged.Parser',
'require Jagged.ScopeHandler',
'require Jagged.Templater',

'class Jagged.Directive.Repeat implements Jagged.IDirective',
{
	
	'private parser (Jagged.Parser)': null,
	'private scopeHandler (Jagged.ScopeHandler)': null,
	'private templater (Jagged.Templater)': null,
	'private array (array)': null,
	'private itemName (string)': null,
	'private originalElement (HTMLElement)': null,
	'private parentElement (HTMLElement)': null,
	'private currentClonedElements ([HTMLElement])': [],
	'private dataElements ([object])': [],
	
	'public construct (Jagged.Parser, Jagged.ScopeHandler, Jagged.Templater) -> undefined': function(parser, scopeHandler, templater)
	{
		this.parser(parser);
		this.scopeHandler(scopeHandler);
		this.templater(templater);
	},
	
	'public initialise (object, string) -> undefined': function(element, value)
	{
		this.originalElement(element);
		this.parentElement(element.parentNode);
		var match = value.match(/^([^\s]+) in ([^\s]+)$/);
		if (!match) {
			throw new Error(
				'Attribute value passed to repeat directive ' +
				'must be of the format \'item in array\''
			);
		}
		this.itemName(match[1]);
		// @todo Check is array
		// @todo Handle object as well
		this.array(this.parser().parse(match[2], element));
		element.parentNode.removeChild(element);
		this.updateListElements();
		this.scopeHandler().bind('objectChanged', 'handleObjectChanged');
	},
	
	'private updateListElements () -> undefined': function()
	{
		
		// Remove all current elements
		// from the parent element and
		// empty the current elements array
		var currentClonedElements = this.currentClonedElements();
		for (var i in currentClonedElements) {
			this.parentElement().removeChild(currentClonedElements[i]);
		}
		currentClonedElements = [];
		
		// Get the repeating array
		var array = this.array();
		
		// Ensure the templater doesn't
		// render until we have processed
		// all items in the list
		this.templater().pause(this);
		
		// For each element in the array...
		for (var i = 0; i < array.length; i++) {
			
			// If it is an object and has already
			// been associated with an element, add
			// that element to the new list
			if (typeof array[i] == 'object' && this.dataHasElement(array[i])) {
				currentClonedElements.push(this.getElementForData(array[i]));
			
			// Otherwise...
			} else {
				
				// Create a clone of the original
				var clone = this.originalElement().cloneNode(true);
				
				// Remove the repeat attribute so
				// it is not processed again
				clone.removeAttribute('jagged.directive.repeat');
				
				// Add it to the new list
				currentClonedElements.push(clone);
				
				// Record the array element against the
				// cloned html element within this class
				this.dataElements('push', {
					data:    array[i],
					element: clone
				})
				
				// Register the array element against
				// the clone within the scope handler
				var properties = {};
				properties[this.itemName()] = array[i];
				this.scopeHandler().registerProperties(clone, properties);
				
			}
		}
		
		// Add each element to the parent element
		for (var i = 0; i < currentClonedElements.length; i++) {
			this.parentElement().appendChild(currentClonedElements[i]);
		};
		
		// Save the new list
		this.currentClonedElements(currentClonedElements);
		
		// Allow the templater to do its thing
		this.templater().unPause(this);
		
	},
	
	'private dataHasElement (mixed) -> boolean': function(data)
	{
		var dataElements = this.dataElements();
		for (var i = 0; i < dataElements.length; i++) {
			if (dataElements[i].data === data) return true
		}
		return false;
	},
	
	'private getElementForData (mixed) -> HTMLElement': function(data)
	{
		var dataElements = this.dataElements();
		for (var i = 0; i < dataElements.length; i++) {
			if (dataElements[i].data === data) return dataElements[i].element;
		}
	},
	
	'private handleObjectChanged (string, object) -> undefined': function(propertyName, object)
	{
		if (this.array() !== object.get(propertyName)) return;
		this.updateListElements();
	}
	
});
