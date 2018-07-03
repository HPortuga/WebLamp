var cy = cytoscape({
  container: document.querySelector('#workflow'),

  boxSelectionEnabled: false,
  autounselectify: true,

  style: cytoscape.stylesheet()
    .selector('node')
      .css({
        'content': 'data(name)',
        'text-valign': 'center',
        'color': 'white',
        'text-outline-width': 2,
        'background-color': '#999',
        'text-outline-color': '#999'
      })
    .selector('node > node')
      .css({
        'background-color': '#d1ab10',
        'width': 9,
        'height': 9,
      })
    .selector('.ghost')
      .css({
        'visibility': 'hidden'
      })
    .selector('edge')
      .css({
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'target-arrow-color': '#ccc',
        'line-color': '#ccc',
        'width': 1
      })
    .selector(':selected')
      .css({
        'background-color': 'black',
        'line-color': 'black',
        'target-arrow-color': 'black',
        'source-arrow-color': 'black'
      })
    .selector('.faded')
      .css({
        'opacity': 0.25,
        'text-opacity': 0
      })
    .selector('.eh-handle')
      .css({
        'background-color': 'red',
        'width': 12,
        'height': 12,
        'shape': 'ellipse',
        'overlay-opacity': 0,
        'border-width': 12, // makes the handle easier to hit
        'border-opacity': 0
      })
    .selector('.eh-hover')
      .css({
        'background-color': 'red'
      })
    .selector('.eh-source')
      .css({
        'border-width': 2,
        'border-color': 'red'
      })
    .selector('.eh-target')
      .css({
        'border-width': 2,
        'border-color': 'red'
      })
    .selector('.eh-preview, .eh-ghost-edge')
      .css({
        'background-color': 'red',
        'line-color': 'red',
        'target-arrow-color': 'red',
        'source-arrow-color': 'red'
      })
    .selector('$node > node')
      .css({
        'text-valign': 'center',
        'text-halign': 'center',
        'shape': 'cutrectangle',
        'border-width': 2
      })
});

var eh = cy.edgehandles();



// WorkflowManager //

// Add Data Reader
var data; 
var nodeIds = 0;
function onFileSelected(event) {
  data = new DataReader(event); 
}

var btn = document.getElementById("addReader");
btn.onclick = function() {
  var nodeDataReader = {
    nome: document.getElementById("readerName").value,
    nSaidas: document.getElementById("nSaidasReader").value,
    data: data
  };

  // [0] = parent node; [>0] = child nodes
  var parentNode = [{
    group: "nodes",
    data: {
      id: nodeIds++,
      name: nodeDataReader.nome,
      output: nodeDataReader.data.matriz
    }
  }];

  // Parent size is set by its child's positions,
  // so create ghost node to fix parent position
  var ghostNode = {
    data: {
      id: nodeIds++,
      parent: parentNode[0].data.id
    },
    classes: 'ghost',
    renderedPosition: {
      x: 0,
      y: 10
    }
  };
  parentNode.push(ghostNode);

  // Set child node
  var nodeSpacement = 0;
  var nodeHeight = 33;
  while (nodeDataReader.nSaidas-- > 0) {
    var childNode = {
      group: "nodes",
      data: {
        id: nodeIds++,
        parent: parentNode[0].data.id
      },
      renderedPosition: {
        x: nodeSpacement,
        y: nodeHeight
        }
      };

      nodeSpacement += 25;      
      parentNode.push(childNode);
  }

  cy.add(parentNode);

  // lock child nodes
  for (var i = 1; i < parentNode.length; i++) {
    cy.$("#" + parentNode[i].data.id)
      .on('grab', function(){ this.ungrabify(); })
      .on('free', function(){ this.grabify(); });
  }
  
  // Stop the page from refreshing after btn click
  return false;
}

// Add Data Filter
var addFilter = document.getElementById("addFilter");
addFilter.onclick = function() {
  var nodeDataFilter = {
    nome: document.getElementById("filterName").value,
    nEntradas: document.getElementById("nEntradasFilter").value,
    nSaidas: document.getElementById("nSaidasFilter").value
  };

  var parentNode = [{
    group: "nodes",
    data: {
      id: nodeIds++,
      name: nodeDataFilter.nome
    }
  }];

  // Input nodes
  var nodeSpacement = 0;
  var nodeHeight = -33;
  while (nodeDataFilter.nEntradas-- > 0) {
    var childNode = {
      group: "nodes",
      data: {
        id: nodeIds++,
        parent: parentNode[0].data.id
      },
      renderedPosition: {
        x: nodeSpacement,
        y: nodeHeight
        }
      };

      nodeSpacement += 25;      
      parentNode.push(childNode);
  }

  // Output nodes
  nodeSpacement = 0;
  nodeHeight = 33;
  while (nodeDataFilter.nSaidas-- > 0) {
    var childNode = {
      group: "nodes",
      data: {
        id: nodeIds++,
        parent: parentNode[0].data.id
      },
      renderedPosition: {
        x: nodeSpacement,
        y: nodeHeight
        }
      };

      nodeSpacement += 25;      
      parentNode.push(childNode);
  }

  cy.add(parentNode);
  for (var i = 1; i < parentNode.length; i++) {
    cy.$("#" + parentNode[i].data.id)
      .on('grab', function(){ this.ungrabify(); })
      .on('free', function(){ this.grabify(); });
  }

  return false;
}


// Add Data Writer
var addWriter = document.getElementById("addWriter");
addWriter.onclick = function() {
  var nodeDataWriter = {
    nome: document.getElementById("writerName").value,
    nEntradas: document.getElementById("nEntradasWriter").value
  };

  var parentNode = [{
    group: "nodes",
    data: {
      id: nodeIds++,
      name: nodeDataWriter.nome
    }
  }];

  var ghostNode = {
    data: {
      id: nodeIds++,
      parent: parentNode[0].data.id
    },
    classes: 'ghost',
    renderedPosition: {
      x: 0,
      y: -10
    }
  };
  parentNode.push(ghostNode);

  var nodeSpacement = 0;
  var nodeHeight = -33;
  while (nodeDataWriter.nEntradas-- > 0) {
    var childNode = {
      group: "nodes",
      data: {
        id: nodeIds++,
        parent: parentNode[0].data.id
      },
      renderedPosition: {
        x: nodeSpacement,
        y: nodeHeight
        }
      };

      nodeSpacement += 25;      
      parentNode.push(childNode);
  }

  cy.add(parentNode);

  for (var i = 1; i < parentNode.length; i++) {
    cy.$("#" + parentNode[i].data.id)
      .on('grab', function(){ this.ungrabify(); })
      .on('free', function(){ this.grabify(); });
  }
  
  return false;
}