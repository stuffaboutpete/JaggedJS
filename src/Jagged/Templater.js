define(

'require Jagged.Parser',
'require Jagged.Helper.Array',

'class Jagged.Templater',
{
	
	'private parser (Jagged.Parser)': null,
	'private knownNodes ([Node])': [],
	'private drawNodeQueue ([Node])': [],
	'private renderingPaused (boolean)': false,
	
	'public construct (Jagged.Parser) -> undefined': function(parser)
	{
		this.parser(parser);
	},
	
	'public render (Node) -> Jagged.Templater': function(rootNode)
	{
		var allElements = rootNode.getElementsByTagName('*');
		for (var i = 0; i < allElements.length; i++) {
			for (var j in allElements[i].childNodes) {
				var childNode = allElements[i].childNodes[j];
				if (childNode.nodeType != 3 || childNode.textContent.match(/^[\s]+$/)) continue;
				this.addToQueue(childNode);
			}
		}
		this.drawQueue();
		return this;
	},
	
	'public pauseRendering () -> Jagged.Templater': function()
	{
		this.renderingPaused(true);
		return this;
	},
	
	'public unPauseRendering () -> Jagged.Templater': function()
	{
		this.renderingPaused(false);
		this.drawQueue();
		return this;
	},
	
	'private addToQueue (Node) -> undefined': function(node)
	{
		if (!this.nodeIsKnown(node)) {
			this.knownNodes('push', {
				node: node,
				originalContent: node.textContent
			});
		}
		this.drawNodeQueue('push', node);
	},
	
	'private nodeIsKnown (Node) -> boolean': function(node)
	{
		var knownNodes = this.knownNodes();
		for (var i in knownNodes) {
			if (knownNodes[i].node === node) return true;
		}
		return false;
	},
	
	'private getOriginalNodeContent (object) -> string': function(node)
	{
		var knownNodes = this.knownNodes();
		for (var i in knownNodes) {
			if (knownNodes[i].node === node) return knownNodes[i].originalContent;
		}
	},
	
	'private drawQueue () -> undefined': function()
	{
		if (this.renderingPaused()) return;
		var drawNodeQueue = this.drawNodeQueue();
		drawNodeQueue = Jagged.Helper.Array.removeDuplicates(drawNodeQueue);
		drawNodeQueue = this.removeOrphaned(drawNodeQueue);
		for (var i in drawNodeQueue) this.drawNode(drawNodeQueue[i]);
		this.drawNodeQueue([]);
	},
	
	'private drawNode (Node) -> undefined': function(node)
	{
		var originalContent = this.getOriginalNodeContent(node);
		var matches = originalContent.match(/{{[^}]+}}/g);
		if (!matches) return;
		var newContent = originalContent;
		for (var i = 0; i < matches.length; i++) {
			var output = this.parser().parse(matches[i].slice(2, -2), node);
			if (typeof output != 'undefined') {
				newContent = newContent.replace(matches[i], output);
			}
		}
		if (node.textContent != newContent) node.textContent = newContent;
	},
	
	'private removeOrphaned ([Node]) -> [Node]': function(nodes)
	{
		var attached = [];
		for (var i in nodes) {
			if (this.isInDocument(nodes[i])) attached.push(nodes[i]);
		}
		return attached;
	},
	
	'private isInDocument (Node) -> boolean': function(node)
	{
		if (node === document) return true;
		node = node.parentNode;
		if (node) return this.isInDocument(node);
		return false;
	}
	
});
