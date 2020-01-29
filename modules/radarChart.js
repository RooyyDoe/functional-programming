// This library is created by Nadieh Bremer
// https://bl.ocks.org/nbremer 

export default function RadarChart(id, data, color) {
	let cfg = {
		w: 1200, //Width of the circle
		h: 470, //Height of the circle
		margin: { top: 40, right: 40, bottom: 40, left: 40 }, //The margins of the SVG
		levels: 4, //How many levels or inner circles should there be drawn
		maxValue: 0, //value of the biggest circle in the radarChart
		labelFactor: 1.1, //How much farther than the radius of the outer circle should the labels be placed
		wrapWidth: 60, //The number of pixels after which a label needs to be given a new line
		opacityArea: 0.3, //The opacity of the area of the blob
		dotRadius: 3, //The size of the colored circles of each blob
		opacityCircles: .7, //The opacity of the circles of each blob
		strokeWidth: 2, //The width of the stroke around each blob
		roundStrokes: false, //If true the area and stroke will follow a round path (cardinal-closed)
		color: color //Color function
	};

	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	let maxValue = Math.max(cfg.maxValue, d3.max(data, (i) => {
		return d3.max(i.map((o) => {
			// console.log(o.value); // list with every value
			return o.value;
		}));
	}));

	let allAxis = (data[0].map( (i) => {
			return i.axis;
		})), //Names of each axis out of the data
		total = allAxis.length, //The number of different axes
		radius = Math.min(cfg.w / 2, cfg.h / 2), //Radius of the outermost circle
		Format = d3.format('%'), //Percentage formatting
		angleSlice = Math.PI * 2 / total; //The width in radians of each "slice"

	//Scale for the radius
	let rScale = d3.scale.linear()
		.range([0, radius])
		.domain([0, maxValue]);

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select('svg').remove();

	//Initiate the radar chart SVG
	let svg = d3.select(id).append('svg')
		.attr('width', cfg.w + cfg.margin.left + cfg.margin.right)
		.attr('height', cfg.h + cfg.margin.top + cfg.margin.bottom)
		.attr('class', 'radar' + id);

	//Append a g element		
	let g = svg.append('g')
		.attr('transform', 'translate(' + (cfg.w / 2 + cfg.margin.left) + ',' + (cfg.h / 2 + cfg.margin.top) + ')');

	//Filter for the outside glow
	let filter = g.append('defs').append('filter').attr('id', 'glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

	//Wrapper for the grid & axes
	let axisGrid = g.append('g').attr('class', 'axisWrapper');

	//Draw the background circles
	axisGrid.selectAll('.levels')
		.data(d3.range(1, (cfg.levels + 1)).reverse())
		.enter()
		.append('circle')
		.attr('class', 'gridCircle')
		.attr('r', (d) => {
			//console.log(radius / cfg.levels * d); // List: 260, 195, 130, 65
			return radius / cfg.levels * d;
		})
		.style('fill', '#DFE4F5')
		.style('stroke', '#4A4B4E')
		.style('fill-opacity', cfg.opacityCircles)
		.style('filter', 'url(#glow)');

	//Text indicating at what % each level is
	axisGrid.selectAll('.axisLabel')
		.data(d3.range(1, (cfg.levels + 1)).reverse())
		.enter()
		.append('text')
		.attr('class', 'axisLabel')
		.attr('x', 4)
		.attr('y', (d) => {
			// console.log(-d * radius / cfg.levels) // list: -260 -195 -130 -60
			return -d * radius / cfg.levels;
		})
		.attr('dy', '1.2em')
		.style('font-size', '10px')
		.attr('fill', '#A7AAB2')
		.text((d) => {
			// console.log(maxValue * d / cfg.levels) // list: 0.48, 0.36, 0.24, 0.12
			return Format(maxValue * d / cfg.levels);
		});

	//Create the straight lines radiating outward from the center
	let axis = axisGrid.selectAll('.axis')
		.data(allAxis)
		.enter()
		.append('g')
		.attr('class', 'axis');
	//Append the lines
	axis.append('line')
		.attr('x1', 0)
		.attr('y1', 0)
		.attr('x2', (d, i) => {
			return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); // Coordinates of every x as
		})
		.attr('y2', (d, i) => {
			return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); // Coordinates of every y as
		})
		.attr('class', 'line')
		.style('stroke', '#B0B4C1')
		.style('stroke-width', '1px');

	//Append the labels at each axis
	axis.append('text')
		.attr('class', 'legend')
		.style('font-size', '11px')
		.attr('text-anchor', 'middle')
		.attr('x', (d, i) => {
			return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); // Coordinates of every x as
		})
		.attr('y', (d, i) => {
			return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); // Coordinates of every y as
		})
		.text((d) =>   {
			return d;
		});

	//The radial line function
	let radarLine = d3.svg.line.radial()
		.interpolate('linear-closed')
		.radius((d) => {
			// console.log(rScale(d.value)) // scales that are going to be plotted in the radarChart
			return rScale(d.value);
		})
		.angle((d, i) => {
			// console.log(i * angleSlice) // calculating the angle between points.
			return i * angleSlice;
		});
	if (cfg.roundStrokes) {
		radarLine.interpolate('cardinal-closed');
	}

	//Create a wrapper for the blobs	
	let blobWrapper = g.selectAll('.radarWrapper')
		.data(data)
		.enter().append('g')
		.attr('class', 'radarWrapper');

	//Append the backgrounds	
	blobWrapper
		.append('path')
		.attr('class', 'radarArea')
		.attr('d', (d, i) => {
			// console.log(radarLine(d)) // gives a list with all the coordinates where the blob-dots are of each continent.
			return radarLine(d);
		})
		.style('fill', (d, i) => {
			return cfg.color(i);
		})
		.style('fill-opacity', cfg.opacityArea)
		.on('mouseover', function (d, i) {
			//Dim all blobs
			d3.selectAll('.radarArea')
				.transition().duration(200)
				.style('fill-opacity', 0.5);
			//Bring back the hovered over blobx
			d3.select(this)
				.transition().duration(200)
				.style('fill-opacity', 0.8);
		})
		.on('mouseout', function () {
			//Bring back all blobs
			d3.selectAll('.radarArea')
				.transition().duration(200)
				.style('fill-opacity', cfg.opacityArea);
		});

	//Create the outlines	
	blobWrapper.append('path')
		.attr('class', 'radarStroke')
		.attr('d', (d, i) => {
			// console.log(radarLine(d)) // gives a list with all the coordinates where the blob-dots are of each continent.
			return radarLine(d);
		})
		.style('stroke-width', cfg.strokeWidth + 'px')
		.style('stroke', (d, i) => {
			return cfg.color(i);
		})
		.style('fill', 'none')
		.style('filter', 'url(#glow)');

	//Append the circles
	blobWrapper.selectAll('.radarCircle')
		.data((d, i) =>  {
			// console.log(d) // all the continents in different arrays
			return d;
		})
		.enter().append('circle')
		.attr('class', 'radarCircle')
		.attr('r', cfg.dotRadius)
		.attr('cx', (d, i) =>  {
			return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); // Coordinates of every x as
		})
		.attr('cy', (d, i) =>  {
			return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); // Coordinates of every y as
		})
		.style('fill', (d, i, j) =>  {
			return cfg.color(j);
		})
		.style('fill-opacity', 0.8);

} //RadarChart

