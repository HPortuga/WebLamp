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
	addChildNodes(newNode) {
		// iteration 0: input nodes ; iteration 1: output nodes
		var childType = {
			numChilds: this.parentNode.data.info.nEntradas,
			iteration: 0,
			spacement: 0
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
					x: childType.spacement,
					y: childType.iteration == 0 ? -height : height 
				}
			};

			childType.spacement += 25;
			childNodes.push(child);

			this.shouldAddOutput(childType);
		}

		for (var i = 0; i < childNodes.length; i++)
			newNode.push(childNodes[i]);

		cy.add(newNode);
		this.lockNodes(newNode);
	}

	// Chekcs if child node needs output nodes
	shouldAddOutput(childType) {
		if (childType.numChilds == 0 && childType.iteration == 0) { 
			childType.numChilds = this.parentNode.data.info.nSaidas;
	 		childType.iteration = 1;
	 		childType.spacement = 0;
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

	createNode() {
		var newNode = new Array();
		newNode.push(this.parentNode);

		if (this.type != "filter")
			newNode.push(this.newGhostNode());

		this.addChildNodes(newNode);
	}
}

class DataReader extends Activity {
	constructor(contents) {
		super("reader");
		this.setOutput(contents, 0, 0);
		this.setParentNode();
	}

	setOutput(contents, numLinhas, numDimensoes) {
		if (contents == null) {
		var matrix = new Array(numLinhas);
		for (var i = 0; i < numLinhas; i++)
			matrix[i] = new Array(numDimensoes);

		} else {
			var matrix = {
				ids: [],
				labels: [],
				numLinhas: parseInt(contents[1]),
				numDimensoes: parseInt(contents[2])
			};

			var dados = new Array(matrix.numLinhas);

			for (var i = 0; i < matrix.numLinhas; i++) {
				dados[i] = new Array(matrix.numDimensoes);
			}

			for (var i = 0; i < matrix.numLinhas; i++) {
				var linha = contents[i+4].split(";");
				matrix.ids[i] = parseInt(linha[0]);
				for (var j = 0; j < matrix.numDimensoes; j++) {
					dados[i][j] = parseFloat(linha[j+1]);
				}
				matrix.labels[i] = linha[j+1];
			}

			matrix.data = dados;
	   }

		
		this.output = {
			contents: contents,
			matriz: matrix
		}
	}

	setParentNode() {
		this.parentNode.data.name = document.getElementById("readerName").value;
		this.parentNode.data.info = {
			nEntradas: 0,
			nSaidas: document.getElementById("nSaidasReader").value,
			height: 40,
			tipo: this.type,
			dependencias: 0,
			output: this.output
		};
	}
}

class DataFilter extends Activity {
	constructor() {
		super("filter");
		this.setParentNode();
	}

	setParentNode() {
		this.parentNode.data.name = document.getElementById("filterName").value;
		this.parentNode.data.info = {
			nEntradas: document.getElementById("nEntradasFilter").value,
			nSaidas: document.getElementById("nSaidasFilter").value,
			height: 20,
			tipo: this.type,
			dependencias: document.getElementById("nEntradasFilter").value
		};
	}
}

class DataWriter extends Activity {
	constructor() {
		super("writer");
		this.setParentNode();
	}

	setParentNode() {
		this.parentNode.data.name = document.getElementById("writerName").value;
		this.parentNode.data.info = {
			nEntradas: document.getElementById("nEntradasWriter").value,
			nSaidas: 0,
			height: 40,
			tipo: this.type,
			dependencias: document.getElementById("nEntradasWriter").value
		};
	}
}