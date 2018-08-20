class DataWriterOld {
	constructor(contents) {
		this.contents = contents;
	}

	gerarCsv() {
		const rows = new Array();
		rows.push(["id", "xAxis", "yAxis", "label"])
		for (var i = 0; i < this.contents.length; i++) {
			rows.push([this.contents.ids[i], this.contents[i][0],
				this.contents[i][1], this.contents.labels[i]]);
		}

		let csvContent = "data:text/csv;charset=utf-8,";
		rows.forEach(function(rowArray){
		   let row = rowArray.join(",");
		   csvContent += row + "\n";
		});

		var encodedUri = encodeURI(csvContent);
		
		return encodedUri;
	}

	mostraConteudo() {
		console.log(this.contents);
	}
}