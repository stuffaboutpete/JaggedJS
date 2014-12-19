define(

'require Jagged.Parser',
'require Jagged.Helper.Array',
'require Jagged.Helper.String',

'class Jagged.Templater',
{
	
	'private namespaces ([string])': [],
	'private parser (Jagged.Parser)': null,
	'private injector (Jagged.Injector)': null,
	'private parseQueue ([HTMLElement])': [],
	'private directiveOuterElementQueue ([HTMLElement])': [],
	'private directiveAllElementQueue ([HTMLElement])': [],
	'private directiveElementsProcessed ([HTMLElement])': [],
	'private directiveClassesLoading ([object])': [],
	'private loadingPausedDirectives ([Jagged.IDirective])': [],
	'private runningDirective (boolean)': false,
	'private knownNodes ([Node])': [],
	
	'public construct ([string], Jagged.Injector, Jagged.Parser) -> undefined': function(customNamespaces, injector, parser)
	{
		
		// Add Jagged.Directive to the
		// list of supplied namespaces
		customNamespaces.unshift('Jagged.Directive');
		
		// Loop through and change all namespaces
		// to hyphen casing instead of Pascal
		for (var i in customNamespaces) {
			var parts = customNamespaces[i].split('.');
			for (var j = 0; j < parts.length; j++) {
				parts[j] = Jagged.Helper.String.pascalToHyphenCasing(parts[j]);
			}
			customNamespaces[i] = parts.join('.');
		}
		
		// Save the inputs
		this.namespaces(customNamespaces);
		this.injector(injector);
		this.parser(parser);
		
	},
	
	'public render (HTMLElement) -> undefined': function(element)
	{
		
		// Save the element for parsing
		this.parseQueue('push', element);
		
		// Save the element to inspect
		// for directories
		this.directiveOuterElementQueue('push', element);
		
		// Check whether we are in a state
		// to process any elements
		this.considerResumingDirectiveQueue();
		
	},
	
	'private addElementsToDirectiveQueue ([HTMLElement]) -> undefined': function(elements)
	{
		
		// Short reference the array helper class
		var ArrayHelper = Jagged.Helper.Array;
		
		// Add the element to the queue of elements
		// which potentially contain a directive.
		// Do not add if it has already been processed
		// or if we've already added it.
		for (var i in elements) {
			if (ArrayHelper.inArray(elements[i], this.directiveElementsProcessed())) continue;
			if (ArrayHelper.inArray(elements[i], this.directiveAllElementQueue())) continue;
			this.directiveAllElementQueue('push', elements[i]);
		}
		
	},
	
	'private considerResumingDirectiveQueue () -> undefined': function()
	{
		
		// Continue processing elements for
		// the presence of directives if we
		// are not loading a directive class
		// file, we are not currently instantiating
		// or initiating a directive or if
		// a directive has indicated that we
		// should pause processing
		if (!this.directiveClassesLoading().length
		&&	!this.runningDirective()
		&&	!this.loadingPausedDirectives().length) {
			this.processDirectiveQueue();
		}
		
	},
	
	'private processDirectiveQueue () -> undefined': function()
	{
		
		// If there are elements that have been
		// specifically requested should be
		// rendered, move all their ancestors
		// into the queue for processing
		if (this.directiveOuterElementQueue().length) this.processDirectiveOuterElementQueue();
		
		// Get the first element in the stack
		var element = this.directiveAllElementQueue().shift();
		
		// If the element variable is empty,
		// we have worked our way through the
		// list. We can now parse the document
		// and drop out here.
		if (typeof element == 'undefined') {
			this.processParseQueue();
			return;
		}
		
		// If we have already inspected this
		// element for the presence of a
		// directive, don't do it again. Move
		// onto the next element in the stack.
		if (Jagged.Helper.Array.inArray(element, this.directiveElementsProcessed())) {
			this.processDirectiveQueue();
			return;
		}
		
		// Add this element to the 'already
		// processed' list so we don't do it again
		this.directiveElementsProcessed('push', element);
		
		// Ensure the element is still in the DOM,
		// moving on to the next element if not
		if (!this.isInDocument(element)) {
			this.processDirectiveQueue();
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
			this.processDirectiveQueue();
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
	
	'private processDirectiveOuterElementQueue () -> undefined': function()
	{
		
		// Get all of the elements which have
		// been specifically requested should
		// be rendered, removing duplicates
		var outerElements = Jagged.Helper.Array.removeDuplicates(this.directiveOuterElementQueue());
		
		// Keep a list of all the ancestors
		// in the list of elements
		var allElements = [];
		
		// Loop through the outer elements...
		for (var i = 0; i < outerElements.length; i++) {
			
			// Get a list of all
			// ancestors as an array
			var elements = Jagged.Helper.Array.enumerateToArray(
				outerElements[i].getElementsByTagName('*')
			);
			
			// Make sure the outer element is
			// included in the list
			allElements.push(outerElements[i]);
			
			// Add all the elements to the collection
			for (var j = 0; j < elements.length; j++) {
				allElements.push(elements[j]);
			};
			
		}
		
		// Store all of the elements we found
		this.addElementsToDirectiveQueue(allElements);
		
		// And reset the outer queue
		this.directiveOuterElementQueue([]);
		
	},
	
	'private runDirective (string) -> undefined': function(directiveClass)
	{
		
		// Get the directive data for the
		// directive class which has just
		// been loaded
		var directiveClassesLoading = this.directiveClassesLoading();
		for (var i = 0; i < directiveClassesLoading.length; i++) {
			if (directiveClassesLoading[i].className == directiveClass) {
				var directiveData = directiveClassesLoading.splice(i, 1)[0];
				break;
			}
		}
		
		// Note that we are processing the
		// directive meaning instantiating
		// and initiating it. This is so that
		// any calls to this class in the meantime
		// can be deferred until after we finish.
		this.runningDirective(true);
		
		// Create the directive class
		var directive = this.injector().resolve(directiveClass);
		
		// Ensure the instanciated class is an instance
		// of Jagged.IDirective, throwing an error if not
		if (!directive.conformsTo('Jagged.IDirective')) {
			throw new Error(
				'Identified directive class must implement ' +
				'Jagged.IDirective (Directive class: ' + classParts.join('.') + ')'
			);
		}
		
		// Save the instance against the directive data
		directiveData.instance = directive;
		
		// Allow the directive to initialise by providing
		// it the element that it was declared on and also
		// the attribute value that it was declared with
		directive.initialise(directiveData.element, directiveData.tagValue);
		
		// Note that we have finished processing
		this.runningDirective(false);
		
		// Move on to the next element in the queue
		// if we aren't waiting for anything
		this.considerResumingDirectiveQueue();
		
	},
	
	'private processParseQueue () -> undefined': function()
	{
		
		// Get all elements which have
		// been requested for render
		var parseQueue = this.removeOrphaned(this.parseQueue());
		
		// Loop through each of the request
		// elements and build an array containing
		// all of their children and themselves
		var allElements = [];
		for (var i in parseQueue) {
			var elements = Jagged.Helper.Array.toArray(parseQueue[i].getElementsByTagName('*'));
			elements.unshift(parseQueue[i]);
			for (var j in elements) allElements.push(elements[j]);
		}
		
		// Remove any duplicate elements
		if (parseQueue.length > 1) allElements = Jagged.Helper.Array.removeDuplicates(allElements);
		
		// Keep an array of the parseable text
		// nodes. These are not HTMLElements.
		var nodes = [];
		
		// Loop through all the nodes contained
		// within all of our elements
		for (var i = 0; i < allElements.length; i++) {
			for (var j in allElements[i].childNodes) {
				var childNode = allElements[i].childNodes[j];
				
				// If this is a node, not an element,
				// and it contains some text, add it
				// to our list of nodes ensuring that
				// we have a record of its original content
				if (childNode.nodeType != 3 || childNode.textContent.match(/^[\s]+$/)) continue;
				this.ensureNodeIsKnown(childNode);
				nodes.push(childNode)
				
			}
			
		}
		
		// Do the parsing of all the text nodes
		this.drawNodes(nodes);
		
		// Reset the parse queue
		this.parseQueue([]);
		
	},
	
	'private drawNodes ([Node]) -> undefined': function(nodes)
	{
		
		// Loop through the nodes...
		for (var i = 0; i < nodes.length; i++) {
			
			// Retrieve the original content
			// for this node
			var content = this.getOriginalNodeContent(nodes[i]);
			
			// Look for text in {{ this format }}
			var matches = content.match(/{{[^}]+}}/g);
			
			// If there were no matches, we
			// have nothing to do here
			if (!matches) continue;
			
			// Loop through each of {{ these }}
			for (var j = 0; j < matches.length; j++) {
				
				// Run the contents of the braces
				// through the parser, recording
				// the output
				var output = this.parser().parse(matches[j].slice(2, -2), nodes[i]);
				
				// If there is output, replace
				// the content with it
				if (typeof output != 'undefined') {
					content = content.replace(matches[j], output);
				}
				
			}
			
			// If the parsed content is different
			// to the original content, replace it
			if (nodes[i].textContent != content) nodes[i].textContent = content;
			
		}
		
	},
	
	'public pause (Jagged.IDirective) -> undefined': function(directive)
	{
		// Record that a directive would
		// like us to pause processing by
		// adding it to a list
		this.loadingPausedDirectives('push', directive);
	},
	
	'public unPause (Jagged.IDirective) -> undefined': function(directive)
	{
		// If the provided directive is in
		// the list of blocking directives,
		// remove it and attempt to continue
		// processing directives
		if (Jagged.Helper.Array.containsElement(directive, this.loadingPausedDirectives())) {
			Jagged.Helper.Array.removeElement(directive, this.loadingPausedDirectives());
			this.considerResumingDirectiveQueue();
		}
	},
	
	'private ensureNodeIsKnown (Node) -> undefined': function(node)
	{
		// If the provided node has never
		// been encountered before, record
		// its original content
		if (!this.nodeIsKnown(node)) {
			this.knownNodes('push', {
				node: node,
				originalContent: node.textContent
			});
		}
	},
	
	'private nodeIsKnown (Node) -> boolean': function(node)
	{
		// Return true if the provided
		// node has been encountered before.
		// Return false otherwise.
		var knownNodes = this.knownNodes();
		for (var i in knownNodes) {
			if (knownNodes[i].node === node) return true;
		}
		return false;
	},
	
	'private getOriginalNodeContent (object) -> string': function(node)
	{
		// Return the original content
		// from a list of known nodes
		var knownNodes = this.knownNodes();
		for (var i in knownNodes) {
			if (knownNodes[i].node === node) return knownNodes[i].originalContent;
		}
	},
	
	'private removeOrphaned ([Node]) -> [Node]': function(nodes)
	{
		// Create a new array containing
		// only nodes which are still
		// attached to the DOM and return it
		var attached = [];
		for (var i in nodes) {
			if (this.isInDocument(nodes[i])) {
				attached.push(nodes[i]);
			}
		}
		return attached;
	},
	
	'private isInDocument (Node) -> boolean': function(node)
	{
		
		// If the node is the document object then
		// we know this element is in the DOM
		if (node === document) return true;
		
		// Otherwise do the same check on the
		// parent node, if it exists
		node = node.parentNode;
		if (node) return this.isInDocument(node);
		
		// If it doesn't exist, we know the
		// node has been disconnected
		return false;
		
	},
	
	'private isInDocument (HTMLElement) -> boolean': function(element)
	{
		
		// If the parent node is the document
		// object then we know this element is
		// in the DOM
		if (element.parentNode === document) return true;
		
		// Otherwise do the same check on the
		// parent element, if it exists
		element = element.parentElement;
		if (element) return this.isInDocument(element);
		
		// If it doesn't exist, we know the
		// element has been disconnected
		return false;
		
	}
	
});
