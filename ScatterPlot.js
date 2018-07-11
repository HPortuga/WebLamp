class ScatterPlot {
	constructor(csvOutput) {
		this.csvOutput = csvOutput;
	}

	draw() {
		const row = d => {
			d.id = +d.id;
			d.xAxis = +d.xAxis;
			d.yAxis = +d.yAxis;
			d.label = +d.label;
			
			return d;
		};

		d3.csv(this.csvOutput, row, data => {
			var margin = {top: 10, right: 20, bottom: 30, left: 40},
		    	width = 760 - margin.left - margin.right,
		    	height = 400 - margin.top - margin.bottom;

			//Create SVG element
			var svg = d3.select(".chart")
				.attr("width", width + margin.left + margin.right)
			    .attr("height", height + margin.top + margin.bottom)
				.append("g")
					.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			// setup x 
			var xScale = d3.scale.linear()
					.domain([
						Math.floor(d3.min(data, d => d.xAxis)) + 0.5,
						Math.ceil(d3.max(data, d => d.xAxis)) - 0.5])
					.range([0, width]);
			
			var xAxis = d3.svg.axis()
				.scale(xScale).
				orient("bottom");
			 
			var xGridlines = d3.svg.axis()
					.scale(xScale)
					.tickSize(-height, -height)
					.tickFormat("")
					.orient("bottom");

			// setup y
			var yScale = d3.scale.linear()
					.domain([
						Math.floor(d3.min(data, d => d.yAxis)) + 0.5,
						Math.ceil(d3.max(data, d => d.yAxis)) - 0.5])
					.range([height, 0]);
			
			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left");

			var yGridlines = d3.svg.axis()
				.scale(yScale)
				.tickSize(-width, 0, 0)
				.tickFormat("")
				.orient("left");

			// x-axis
			svg.append("g")
			    .attr("class", "grid x")
			    .attr("transform", "translate(0," + height + ")")
				.call(xGridlines);

			svg.append("g")
			    .attr("class", "x axis")
			    .attr("transform", "translate(0," + height + ")")
			    .call(xAxis);
			 
			// y-axis
			svg.append("g")
				.attr("class", "grid y")
				.call(yGridlines);

			svg.append("g")
			    .attr("class", "y axis")
			    .call(yAxis);

			// Dots Setup
			svg.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
					.attr("cx", d => xScale(d.xAxis))
					.attr("cy", d => yScale(d.yAxis))
					.attr("id", d => d.id)
					.attr("label", d => d.label)
					.attr("r", 5)
					.style("fill", d => {
						var min = d3.min(data, d => d.label);
						var max = d3.max(data, d => d.label);

						var i = parseInt((d.label - min) / (max - min) * colors.length);

						var result = i < 0 ?
							colors[0] : i >= colors.length?
							colors[colors.length - 1] :
							colors[i];

						return result;
					});
			});
	}
}