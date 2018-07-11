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
  var nEntradas = node[0].data.info.nEntradas;
  while (nEntradas-- > 0) {
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
  var nSaidas = node[0].data.info.nSaidas;
  while (nSaidas-- > 0) { // NEEDS TO REMAIN CONSTANT
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
      name: document.getElementById("readerName").value,
      info: {
        nEntradas: 0,
        nSaidas: document.getElementById("nSaidasReader").value,
        output: data,
        height: 40,
        tipo: "reader",
        dependencias: 0
      }
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
      info: {
        nEntradas: document.getElementById("nEntradasFilter").value,
        nSaidas: document.getElementById("nSaidasFilter").value,
        height: 20,
        tipo: "filter",
        dependencias: document.getElementById("nEntradasFilter").value
      }
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
      info: {
        nEntradas: document.getElementById("nEntradasWriter").value,
        nSaidas: 0,
        height: 40,
        tipo: "writer",
        dependencias: document.getElementById("nEntradasWriter").value
      }
    }
  }];

  addNode(parentNode);

  return false;
}
function test(queue) {
  // this == queue
  var readyNode;
  var i = 0;
  while (queue.length) {  // this.length

    if (i > queue.length) i = 0;  // MAYBE FIXED THIS

    console.log("this is queue inside test");
    for (var c = 0; c < queue.length; c++) {
      console.log(queue[c]);
    }

    var node = queue[i];
    // Check dependencies
    if (node._private.data.info.dependencias > 0) {
      console.log("Tem dependencias");
      continue;
    }
    else {
      console.log("Não tem dependencias");
      readyNode = queue.splice(i,1);
      i--;  // Come back one step after deletion

      console.log("DELETING...")
      console.log(readyNode)
      // Reader must send output to filter
      // Filter must project && send output to writer
      // Writer must print projection

      if (readyNode[0]._private.data.info.tipo == "reader") {
        console.log("READER");

        // Get edge flow
        var childNode = readyNode[0]._private.children[1];
        var flow = {
          source: childNode._private.edges[0]._private.data.source,
          target: childNode._private.edges[0]._private.data.target
        };

        // Find source's parent
        var srcParent = cy.$("#" + flow.source);
        srcParent = srcParent[0]._private.data.parent;
        srcParent = cy.getElementById(srcParent);
        
        // Get parent's output
        var parentOutput = srcParent._private.data.info.output;

        // Find target's parent
        var tgtParent = cy.getElementById(flow.target);
        tgtParent = tgtParent._private.data.parent;
        tgtParent = cy.getElementById(tgtParent);
        // Set target's input
        tgtParent._private.data.info.input = parentOutput;
        tgtParent._private.data.info.dependencias--;
        //console.log(tgtParent);

        var p = new LampVis(2);
        p.setInput(tgtParent._private.data.info.input);
        p.execute();
        var output = p.getOutput();
        //console.log(output);
      }

      else if (readyNode[0]._private.data.info.tipo == "filter") {
        console.log("FILTER");
      }
      
      else if (readyNode[0]._private.data.info.tipo == "writer") {
        console.log("WRITER");
      }
    }

    i++;
  }
}
// Scan nodes to build queue
var scan = document.getElementById("scan");
scan.onclick = function() {
  // Add parent nodes to queue
  var nodes = cy.elements("$node > node");
  console.log("NODES");
  console.log(nodes);

  // Object => Array
  var queue = new Array();
  var i = 0;
  var len = nodes.length;
  while (len > 0) {
    queue[i] = nodes[i];
    len--;
    i++;
  }

  console.log("QUEUE");
  console.log(queue);
  // Correct so far

  // Breaks here
  test(queue);
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
        tipo: "reader",
        dependencias: 0
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
        height: 20,
        tipo: "filter",
        dependencias: 2
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
        height: 40,
        tipo: "writer",
        dependencias: 2
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