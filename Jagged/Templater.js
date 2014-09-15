Class.define(

'Jagged.Templater',
{
	
	Require: [
		'Jagged.Parser',
		'Jagged.Helper.Array'
	],
	
	'private parser': undefined,
	'private knownNodes': [],
	'private drawQueue': [],
	'private renderingPaused': false,
	
	'public construct : Jagged.Parser': function(parser)
	{
		this.set('parser', parser);
	},
	
	'public undefined render : object': function(rootElement)
	{
		var allElements = rootElement.getElementsByTagName('*');
		for (var i = 0; i < allElements.length; i++) {
			for (var j in allElements[i].childNodes) {
				var childNode = allElements[i].childNodes[j];
				if (childNode.nodeType != 3 || childNode.textContent.match(/^[\s]+$/)) continue;
				this.addToQueue(childNode);
			}
		}
		this.drawQueue();
	},
	
	'private undefined addToQueue : object': function(node)
	{
		if (!this.nodeIsKnown(node)) {
			this.get('knownNodes').push({
				node: node,
				originalContent: node.textContent
			});
		}
		this.get('drawQueue').push(node);
	},
	
	'private boolean nodeIsKnown : object': function(node)
	{
		var knownNodes = this.get('knownNodes');
		for (var i in knownNodes) {
			if (knownNodes[i].node === node) return true;
		}
		return false;
	},
	
	'private string getOriginalNodeContent : object': function(node)
	{
		var knownNodes = this.get('knownNodes');
		for (var i in knownNodes) {
			if (knownNodes[i].node === node) return knownNodes[i].originalContent;
		}
	},
	
	'private undefined drawQueue : undefined': function()
	{
		if (this.get('renderingPaused')) return;
		var drawQueue = this.get('drawQueue');
		drawQueue = Jagged.Helper.Array.removeDuplicates(drawQueue);
		for (var i in drawQueue) {
			if (!drawQueue.hasOwnProperty(i)) continue;
			this.drawNode(drawQueue[i]);
		}
		this.set('drawQueue', []);
	},
	
	'private undefined drawNode : object': function(node)
	{
		var parser = this.get('parser');
		var originalContent = this.getOriginalNodeContent(node);
		var matches = originalContent.match(/{{[^}]+}}/g);
		if (!matches) return;
		var newContent = originalContent;
		for (var i = 0; i < matches.length; i++) {
			var output = parser.parse(matches[i].slice(2, -2), node);
			newContent = newContent.replace(matches[i], output);
		}
		if (node.textContent != newContent) node.textContent = newContent;
	}
	
});
