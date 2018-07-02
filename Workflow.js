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
      }),

  layout: {
    name: 'grid', 
    padding: 10
  }
});


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
    classes: 'ghost'
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
  for (var i = 1; i < parentNode.length; i++) 
    cy.$("#" + parentNode[i].data.id).ungrabify();
  
  // Stop the page from refreshing after btn click
  return false;
}

// Add Data Filter
var addFilter = document.getElementById("addFilter");
addFilter.onclick = function() {
  var nodeDataFilter = {
    nome: document.getElementById("filterName").value,
    nEntradas: document.getElementById("nEntradasFilter").value,
    nSaidas: document.getElementById("nSaidasFilter").value,
    data: getInput()
  };

  var parentNode = [{
    group: "nodes",
    data: {
      id: nodeIds++,
      name: nodeDataFilter.nome,
      output: nodeDataFilter.data
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

  for (var i = 1; i < parentNode.length; i++) 
    cy.$("#" + parentNode[i].data.id).ungrabify();

  return false;
}

function getInput() {
  return null;
}