class DataReader {
	constructor(event) {
		var selectedFile = event.target.files[0];
	    var reader = new FileReader();

	    var that = this;
	    reader.onload = function(event) {
		    var contents = event.target.result.split("\n");
			that.setContents(contents);	
	    };

	    reader.readAsText(selectedFile);
	}

	setContents(contents) {
		this.contents = contents;
		this.matriz = constroiMatriz(contents, 0, 0);
	}
}
// asdasdasd
// asdadadasdadasdasdasd
//asdasdasdasd
// asdasdasdadasd
//asdasdasdasd

//asdasdasd
// Constrói uma matiz[][] a partir do conteúdo de um ficheiro ou uma matriz[][] vazia
function constroiMatriz(contents, numLinhas, numDimensoes) {
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

	
	return matrix;
}