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

// Adds child nodes to parent
function addChildNodes(node) {
  // Add input nodes
  var nodeSpacement = 0;
  while (node[0].data.info.nEntradas-- > 0) {
    var childNode = {
      group: "nodes",
      data: {
        id: nodeIds++,
        parent: node[0].data.id
      },
      renderedPosition: {
        x: nodeSpacement,
        y: -node[0].data.info.height
      }
    };

    nodeSpacement += 25;      
    node.push(childNode);
  }

  // Add output nodes
  var nodeSpacement = 0;
  while (node[0].data.info.nSaidas-- > 0) { // NEEDS TO REMAIN CONSTANT
    var childNode = {
      group: "nodes",
      data: {
        id: nodeIds++,
        parent: node[0].data.id
      },
      renderedPosition: {
        x: nodeSpacement,
        y: node[0].data.info.height
      }
    };

    nodeSpacement += 25;      
    node.push(childNode);
  }
};

// Adds node to workflow
function addNode(node) {
  if (node[0].data.info.nEntradas == 0 || node[0].data.info.nSaidas == 0) {  // dataReader || dataWriter
    // Parent size is set by its child's positions,
    // so create ghost node to fix parent position
    var height = 10;
    var ghostNode = {
      data: {
        id: nodeIds++,
        parent: node[0].data.id
      },
      classes: 'ghost',
      renderedPosition: {
        x: 0,
        y: (node[0].data.info.nEntradas == 0 ? height : -height)        
      }
    };

    node.push(ghostNode);
  }

  addChildNodes(node);
  cy.add(node);

  // lock child nodes
  for (var i = 1; i < node.length; i++) {
    cy.$("#" + node[i].data.id)
      .on('grab', function(){ this.ungrabify(); })
      .on('free', function(){ this.grabify(); });
  }
};

// WorkflowManager //

// Add Data Reader
var data; 
var nodeIds = 0;
function onFileSelected(event) {
  data = new DataReader(event); 
}

var btn = document.getElementById("addReader");
btn.onclick = function() {
  var parentNode = [{
    group: "nodes",
    data: {
      id: nodeIds++,
      name: document.getElementById("readerName").value
    },
    info: {
      nEntradas: 0,
      nSaidas: document.getElementById("nSaidasReader").value,
      contents: data,
      height: 40
    }
  }];

  addNode(parentNode);

  // Stop the page from refreshing after btn click
  return false;
}

// Add Data Filter
var addFilter = document.getElementById("addFilter");
addFilter.onclick = function() {
  var parentNode = [{
    group: "nodes",
    data: {
      id: nodeIds++,
      name: document.getElementById("filterName").value,
    },
    info: {
      nEntradas: document.getElementById("nEntradasFilter").value,
      nSaidas: document.getElementById("nSaidasFilter").value,
      height: 20
    }
  }];

  addNode(parentNode);

  return false;
}

// Add Data Writer
var addWriter = document.getElementById("addWriter");
addWriter.onclick = function() {
  var parentNode = [{
    group: "nodes",
    data: {
      id: nodeIds++,
      name: document.getElementById("writerName").value,
    },
    info: {
      nEntradas: document.getElementById("nEntradasWriter").value,
      nSaidas: 0,
      height: 40
    }
  }];

  addNode(parentNode);

  return false;
}

// Scan nodes to build queue
var scan = document.getElementById("scan");
scan.onclick = function() {
  var queue = cy.elements("$node > node");
  queue.execute = function() {
    // this == queue
    console.log(this);
  }

  queue.execute();
}

// Adiciona nós para teste
var testNodes = document.getElementById("testNodes");
testNodes.onclick = function() {
  var parentReader = [{
    group: "nodes",
    data: {
      id: nodeIds++,
      name: "dataReader",
      info: {
        nEntradas: 0,
        nSaidas: 2,
        height: 40,
        type: "reader"
      }
    }
  }];

  var parentFilter = [{
    group: "nodes",
    data: {
      id: nodeIds++,
      name: "dataFilter",
      info: {
        nEntradas: 2,
        nSaidas: 2,
        height: 20
      }
    }
  }];

  var parentWriter = [{
    group: "nodes",
    data: {
      id: nodeIds++,
      name: "dataWriter",
      info: {
        nEntradas: 2,
        nSaidas: 0,
        height: 40
      }
    }
  }];

  addNode(parentReader);
  addNode(parentFilter);
  addNode(parentWriter);

  // Adiciona arestas aos nós
  cy.add([
    {
      group: "edges",
      data: {
        id: nodeIds++,
        source: parentReader[2].data.id,
        target: parentFilter[1].data.id
      }
    },
    {
      group: "edges",
      data: {
        id: nodeIds++,
        source: parentReader[3].data.id,
        target: parentFilter[2].data.id
      }
    },
    {
      group: "edges",
      data: {
        id: nodeIds++,
        source: parentFilter[3].data.id,
        target:parentWriter[2].data.id
      }
    },
    {
      group: "edges",
      data: {
        id: nodeIds++,
        source: parentFilter[4].data.id,
        target:parentWriter[3].data.id
      }
    }
  ]);
};