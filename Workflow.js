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

cy.on("ehcomplete", (event, sourceNode, targetNode, addedEles) => {
  sourceNode._private.parent._private.data.edges = {
    to: targetNode._private.data.id
  };
  targetNode._private.parent._private.data.edges = {
    from: sourceNode._private.data.id
  };
}); 

// WorkflowManager //

// Add Data Reader //
// Get file's input
var contents;
function onFileSelected(event) {
  var selectedFile = event.target.files[0];
  var reader = new FileReader();

  reader.onload = function(event) {
    contents = event.target.result.split("\n");
  };

  reader.readAsText(selectedFile);

  //data = new DataReaderOld(event);
}

var btn = document.getElementById("addReader");
btn.onclick = function() {
  var dataReader = new DataReader(contents);
  dataReader.createNode();

  // Stop the page from refreshing after btn click
  return false;
}

// Add Data Filter
var addFilter = document.getElementById("addFilter");
addFilter.onclick = function() {
  var dataFilter = new DataFilter();
  dataFilter.createNode();

  return false;
}

// Add Data Writer
var addWriter = document.getElementById("addWriter");
addWriter.onclick = function() {
  var dataWriter = new DataWriter();
  dataWriter.createNode();
  return false;
}

// Reader must send output to filter
// Filter must project && send output to writer
// Writer must print projection
function execute(queue) {
  var readyNode;
  var i = 0;
  while (queue.length) {
    // Stops index from exceding queue's length
    if (i > queue.length) i = 0;

    // Check dependencies
    var node = queue[i];

    if (node._private.data.controlPanel.execute())
      console.log("oi");
    else
      console.log("tchau")

    if (node._private.data.info.dependencias > 0) continue;
    else {
      readyNode = queue.splice(i,1);
      i--;  // Come back one step after deletion

      if (readyNode[0]._private.data.info.tipo == "reader") {
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
      }

      else if (readyNode[0]._private.data.info.tipo == "filter") {
        // Project data
        var p = new LampVis(2);
        p.setInput(readyNode[0]._private.data.info.input);
        p.execute();
        var output = p.getOutput();

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
        var parentOutput = output

        // Find target's parent
        var tgtParent = cy.getElementById(flow.target);
        tgtParent = tgtParent._private.data.parent;
        tgtParent = cy.getElementById(tgtParent);

        // Set target's input
        tgtParent._private.data.info.input = parentOutput;
        tgtParent._private.data.info.dependencias--;
      }
      
      else if (readyNode[0]._private.data.info.tipo == "writer") {
        var writer = new DataWriterOld(readyNode[0]._private.data.info.input);
        var csvOutput = writer.gerarCsv();
        localStorage.csvOutput = csvOutput;

        // Download CSV file //
        //window.open(csvOutput);

        // Open ScatterPlot
        var scatterWindow = window.open("ScatterWindow.html")
      }
    }

    i++;
  }

  console.log("TERMINADO");
}

// Scan nodes to build queue
var scan = document.getElementById("scan");
scan.onclick = function() {
  // Add parent nodes to queue
  var nodes = cy.elements("$node > node");

  // Object => Array
  var queue = new Array();
  var i = 0;
  var len = nodes.length;
  while (len > 0) {
    queue[i] = nodes[i];
    len--;
    i++;
  }

  execute(queue);
}
