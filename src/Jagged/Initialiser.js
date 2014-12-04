define(

'require Jagged.Helper.String',
'require Jagged.Helper.Array',
'require Jagged.Templater',
'require Jagged.Injector',
'require Jagged.IDirective',

'class Jagged.Initialiser',
{
	
	'private injector (Jagged.Injector)': null,
	'private namespaces ([string])': null,
	'private allElements ([HTMLElement])': [],
	'private directiveClassesLoading ([object])': [],
	'private loadingPausedDirectives ([Jagged.IDirective])': [],
	
	'public construct ([string], Jagged.Injector) -> undefined': function(customNamespaces, injector)
	{
		
		injector.registerSingleton(this);
		
		// Add Jagged.Directive to the
		// list of supplied namespaces
		customNamespaces.unshift('Jagged.Directive');
		
		// Loop through and change all namespaces
		// to hyphen casing instead of Pascal
		for (var i in customNamespaces) {
			if (!customNamespaces.hasOwnProperty(i)) continue;
			var parts = customNamespaces[i].split('.');
			for (var j = 0; j < parts.length; j++) {
				parts[j] = Jagged.Helper.String.pascalToHyphenCasing(parts[j]);
			}
			customNamespaces[i] = parts.join('.');
		}
		
		// Save the updated namespaces and the injector
		this.namespaces(customNamespaces);
		this.injector(injector);
		
		// Get all elements in the document and save them
		var allElements = document.getElementsByTagName('*');
		var thisAllElements = this.allElements();
		for (var i = 0; i < allElements.length; i++) {
			thisAllElements.push(allElements[i]);
		}
		
		injector.resolve('Jagged.Templater').pauseRendering();
		
		// Start inspecting all the elements
		this.inspectNextElement();
		
	},
	
	'public pauseLoading (Jagged.IDirective) -> undefined': function(directive)
	{
		this.loadingPausedDirectives('push', directive);
	},
	
	'public unPauseLoading (Jagged.IDirective) -> undefined': function(directive)
	{
		if (Jagged.Helper.Array.containsElement(directive, this.loadingPausedDirectives())) {
			Jagged.Helper.Array.removeElement(directive, this.loadingPausedDirectives());
			this.inspectNextElement();
		}
	},
	
	'private inspectNextElement () -> undefined': function()
	{
		
		// Get the first element in the stack
		var element = this.allElements().shift();
		
		// If the element variable is empty,
		// we have worked our way through the
		// list. We can now parse the document
		// and drop out here.
		if (typeof element == 'undefined') {
			this.parseTemplates();
			return;
		}
		
		// Keep an array of directives that we
		// find as we search the document below 
		var directivesFound = [];
		
		// Save a reference to the namespaces
		// we are interested in
		var namespaces = this.namespaces();
		
		// Loop through all attributes
		// on the current directive
		for (var i = 0; i < element.attributes.length; i++) {
			
			// If the element has any attributes that match
			// our namespaces - that is Jagged.Directive or
			// any supplied to the constructor, save the
			// attribute and its value
			for (var j = 0; j < namespaces.length; j++) {
				if (element.attributes[i].name.match(namespaces[j] + '\..*')) {
					directivesFound.push({
						tagName: element.attributes[i].name,
						tagValue: element.attributes[i].value
					});
				}
			}
			
		}
		
		// If we haven't got any matching directives
		// on this element, move on to the next one
		if (!directivesFound.length) {
			this.inspectNextElement();
			return;
		}
		
		// Loop through the directives we found
		for (var i = 0; i < directivesFound.length; i++) {
			
			// Convert the attribute name into a
			// class name. Start by splitting the
			// name by dots.
			var directiveClassParts = directivesFound[i].tagName.split('.');
			
			// Continue by converting each section into
			// pascal casing (from hyphenated)
			for (var j = 0; j < directiveClassParts.length; j++) {
				directiveClassParts[j] = Jagged.Helper.String.hyphenToPascalCasing(
					directiveClassParts[j]
				);
			}
			
			// Rejoin the parts to form the class name
			var className = directiveClassParts.join('.');
			
			// Record that we are loading the class so
			// that we can tell later whether we have
			// finished processing or not
			
			this.directiveClassesLoading('push', {
				className: className,
				element: element,
				tagValue: directivesFound[i].tagValue,
				instance: null
			});
			
			// Require the directive class, running the
			// 'runDirective' method when we finish
			require(className, 'runDirective');
			
		}
	},
	
	'private runDirective (string) -> undefined': function(directiveClass)
	{
		
		var directiveClassesLoading = this.directiveClassesLoading();
		for (var i = 0; i < directiveClassesLoading.length; i++) {
			if (directiveClassesLoading[i].className == directiveClass) {
				var directiveData = directiveClassesLoading.splice(i, 1)[0];
				break;
			}
		}
		
		var directive = this.injector().resolve(directiveClass);
		
		// Ensure the instanciated class is an instance
		// of Jagged.IDirective, throwing an error if not
		if (!directive.conformsTo('Jagged.IDirective')) {
			throw new Error(
				'Identified directive class must implement ' +
				'Jagged.IDirective (Directive class: ' + classParts.join('.') + ')'
			);
		}
		
		directiveData.instance = directive;
		
		// Allow the directive to initialise by providing
		// it the element that it was declared on and also
		// the attribute value that it was declared with
		directive.initialise(directiveData.element, directiveData.tagValue);
		
		// Move on to the next element in the queue
		// if we aren't waiting for anything
		if (!this.directiveClassesLoading().length && !this.loadingPausedDirectives().length) {
			this.inspectNextElement();
		}
		
	},
	
	'private parseTemplates () -> undefined': function()
	{
		// At this stage, we know the whole
		// document needs rendering so we tell
		// the templater to do just that
		// @todo Actually, this isn't true - we should
		// provide the root of any trees we have identified
		this.injector().resolve('Jagged.Templater').unPauseRendering().render(document);
	}
	
});
