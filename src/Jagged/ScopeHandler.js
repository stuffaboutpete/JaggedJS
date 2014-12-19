define(

'require Jagged.Helper.Array',
'require Jagged.Parser.Member',

'class Jagged.ScopeHandler',
{
	
	'public event objectChanged (string, object)': undefined,
	
	'private data ([object])': [],
	'private templater (Jagged.Templater)': null,
	
	'public registerProperties (HTMLElement, object) -> undefined': function(element, properties)
	{
		
		// Get all the element / property associations
		var data = this.data();
		
		// We will need to know whether the
		// element is already registered in
		// the data and also whether any
		// changes were made to the data
		var elementFound = false;
		var changeMade = false;
		
		// If the element is already registered...
		for (var i = 0; i < data.length; i++) {
			if (data[i].element !== element) continue;
			
			// Loop through the new properties object
			for (var j in properties) {
				
				// If any new property is not the same
				// as the existing one or there is no
				// existing one... 
				if (data[i].properties[j] !== properties[j]) {
					
					// Bind to the new property
					// change event and save it
					if (typeof properties[j].bind == 'function') {
						properties[j].bind('change', 'handleObjectChange');
					}
					data[i].properties[j] = properties[j];
					
					// Record that we made a change
					changeMade = true;
					
				}
				
			}
			
			// If we got here, we did find the
			// element and we can stop iterating
			elementFound = true;
			break;
			
		}
		
		// If no element was found, add
		// it to the data
		if (!elementFound) {
			this.data('push', {
				element:    element,
				properties: properties
			});
			for (var i in properties) {
				if (typeof properties[i].bind == 'function') {
					properties[i].bind('change', 'handleObjectChange');
				}
			}
		}
		
		// If any change was made, ensure the
		// data variable is up to date
		if (changeMade) this.data(data);
		
		// If the element is new or a change
		// has been made to an existing element,
		// inform the templater
		if (!elementFound || changeMade) this.informTemplater(element);
		
	},
	
	'public getScopeObject (object) -> object': function(element)
	{
		var returnObject = {};
		var elementStack = [element];
		while (element.parentElement !== null) {
			elementStack.push(element.parentElement);
			element = element.parentElement;
		}
		for (var i = elementStack.length; i > 0; i--) {
			var elementProperties = this.getElementProperties(elementStack[i-1]);
			for (var j in elementProperties) returnObject[j] = elementProperties[j];
		}
		return returnObject;
	},
	
	'public registerTemplater (Jagged.Templater) -> undefined': function(templater)
	{
		this.templater(templater);
	},
	
	'private getElementProperties (object) -> object': function(element)
	{
		var data = this.data();
		var properties = {};
		for (var i = 0; i < data.length; i++) {
			if (data[i].element === element) {
				for (var j in data[i].properties) properties[j] = data[i].properties[j];
			}
		}
		return properties;
	},
	
	'private informTemplater (object) -> undefined': function(element)
	{
		var templater = this.templater();
		if (templater) templater.render(element);
	},
	
	'private handleObjectChange (string, object) -> undefined': function(propertyName, object)
	{
		var elements = this.getElementsFromObject(object);
		for (var i in elements) this.informTemplater(elements[i]);
		this.trigger('objectChanged', [propertyName, object]);
	},
	
	'private getElementsFromObject (object) -> [object]': function(object)
	{
		// @todo Erm, I've just noticed this doesn't use the object variable?!?
		var elements = [];
		var data = this.data();
		for (var i = 0; i < data.length; i++) {
			for (var j in data[i].properties) {
				if (data[i].properties[j] instanceof Jagged.Parser.Member) {
					elements.push(data[i].element);
				}
			}
		}
		elements = Jagged.Helper.Array.removeDuplicates(elements);
		return elements;
	}
	
});
