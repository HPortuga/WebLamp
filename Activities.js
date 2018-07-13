var nodeIds = 0;
class Activity {
	constructor(type) {
		this.parentNode = {
			group: "nodes",
			data: {
				id: nodeIds++
			}
		};

		this.type = type;
	}

	// Creates a ghost node into parentNode to fix child's position
	// (only for reader & writer)
	newGhostNode() {
		var height = 10;
		var ghostNode = {
			data: {
				id: nodeIds++,
				parent: this.parentNode.data.id
			},
			classes: "ghost",
			renderedPosition: {
				x: 0,
				y: (this.type == "reader" ? height : -height)
			}
		}

		return ghostNode;
	}

	// Adds child nodes to parent node
	addChildNodes() {
		// iteration 0: input nodes ; iteration 1: output nodes
		var childType = {
			numChilds: this.parentNode.data.info.nEntradas,
			iteration: 0
		}
		
		this.shouldAddOutput(childType)

		var childNodes = new Array();
		var nodeSpacement = 0;
		var height = this.parentNode.data.info.height;
		while (childType.numChilds-- > 0) {
			var child = {
				group: "nodes",
				data: {
					id: nodeIds++,
					parent: this.parentNode.data.id
				},
				renderedPosition: {
					x: nodeSpacement,
					y: childType.iteration == 0 ? -height : height 
				}
			};

			nodeSpacement += 25;
			childNodes.push(child);

			this.shouldAddOutput(childType);
		}

		return childNodes;
	}

	// Chekcs if child node needs output nodes
	shouldAddOutput(childType) {
		if (childType.numChilds == 0 && childType.iteration == 0) { 
			childType.numChilds = this.parentNode.data.info.nSaidas;
	 		childType.iteration = 1;
	 	}

	 	return childType;
	}

	lockNodes(nodes) {
		for (var i = 1; i < nodes.length; i++) {
	   	cy.$("#" + nodes[i].data.id)
	      	.on('grab', function(){ this.ungrabify(); })
	      	.on('free', function(){ this.grabify(); });
	   }
	}
}

class DataReader extends Activity {
	constructor(data) {
		super("reader");
		this.setParentNode(data);
	}

	setParentNode() {
		this.parentNode.data.name = document.getElementById("readerName").value;
		this.parentNode.data.info = {
			nEntradas: 0,
			nSaidas: document.getElementById("nSaidasReader").value,
			height: 40,
			tipo: this.type,
			dependencias: 0,
			output: data
		};
	}

	createNode() {
		var newNode = new Array();
		newNode.push(this.parentNode);
		newNode.push(this.newGhostNode());
		var childNodes = this.addChildNodes();
		for (var i = 0; i < childNodes.length; i++)
			newNode.push(childNodes[i]);

		cy.add(newNode);
		this.lockNodes(newNode);
	}

}

class DataFilter extends Activity {

}

class DataWriter extends Activity {

}