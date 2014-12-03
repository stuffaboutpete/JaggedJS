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
		var hasProperties = false;
		for (var i in properties) {
			if (properties.hasOwnProperty(i)) {
				hasProperties = true;
				break;
			}
		}
		if (hasProperties) {
			this.data('push', {
				element: element,
				properties: properties
			});
		}
		for (var i in properties) {
			if (typeof properties[i].bind == 'function') {
				properties[i].bind('change', 'handleObjectChange');
			}
		}
		this.informTemplater(element);
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
