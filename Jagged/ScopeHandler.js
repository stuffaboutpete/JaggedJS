Class.define(

'Jagged.ScopeHandler',
{
	
	Require: [
		'Jagged.Helper.Array',
		'Jagged.Parser.IMember'
	],
	
	Events: [
		'objectChanged : string object'
	],
	
	'private data': [],
	'private templater': undefined,
	
	'public undefined registerProperties : object object': function(element, properties)
	{
		var hasProperties = false;
		for (var i in properties) {
			if (properties.hasOwnProperty(i)) {
				hasProperties = true;
				break;
			}
		}
		if (hasProperties) {
			this.get('data').push({
				element: element,
				properties: properties
			});
		}
		for (var i in properties) {
			if (!properties.hasOwnProperty(i)) continue;
			if (properties[i].instanceOf('Jagged.Parser.IMember')) {
				// @todo Should this class have knowledge of the IMember interface?
				properties[i].getObject().bind('change', 'objectChanged');
			} else if (properties[i].instanceOf(Class)) {
				properties[i].bind('change', 'objectChanged');
			}
		}
	},
	
	'public object getScopeObject : object': function(element)
	{
		var returnObject = {};
		var elementStack = [element];
		while (element.parentElement !== null) {
			elementStack.push(element.parentElement);
			element = element.parentElement;
		}
		for (var i = elementStack.length; i > 0; i--) {
			var elementProperties = this.getElementProperties(elementStack[i-1]);
			for (var j in elementProperties) {
				if (!elementProperties.hasOwnProperty(j)) continue;
				returnObject[j] = elementProperties[j];
			}
		}
		return returnObject;
	},
	
	'public undefined registerTemplater : Jagged.Templater': function(templater)
	{
		this.set('templater', templater);
	},
	
	'private object getElementProperties : object': function(element)
	{
		var data = this.get('data');
		var properties = {};
		for (var i = 0; i < data.length; i++) {
			if (data[i].element === element) {
				for (var j in data[i].properties) {
					if (!data[i].properties.hasOwnProperty(j)) continue;
					properties[j] = data[i].properties[j];
				}
			}
		}
		return properties;
	},
	
	'private undefined informTemplater : object': function(element)
	{
		var templater = this.get('templater');
		if (templater) templater.render(element);
	},
	
	'public undefined objectChanged : string object': function(propertyName, object)
	{
		var elements = this.getElementsFromObject(object);
		for (var i in elements) {
			if (!elements.hasOwnProperty(i)) continue;
			this.informTemplater(elements[i]);
		}
		this.trigger('objectChanged', propertyName, object);
	},
	
	'private [object] getElementsFromObject : object': function(object)
	{
		// @todo Erm, I've just noticed this doesn't use the object variable?!?
		var elements = [];
		var data = this.get('data');
		for (var i = 0; i < data.length; i++) {
			for (var j in data[i].properties) {
				if (!data[i].properties.hasOwnProperty(j)) continue;
				if (data[i].properties[j].instanceOf('Jagged.Parser.IMember')) {
					elements.push(data[i].element);
				}
			}
		}
		elements = Jagged.Helper.Array.removeDuplicates(elements);
		return elements;
	}
	
});
