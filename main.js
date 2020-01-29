import getData from './modules/getData.js';
import clean from './modules/cleaningFunctions.js';
import radarChart from './modules/radarChart.js';

const ContinentQuery = `
	SELECT ?continents WHERE {
		<https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?continents .
}`;

getData(ContinentQuery)
	.then((rawContinent) => clean.cleanData(rawContinent))
	.then((filteringEmptyData) => clean.filterEmptyResults(filteringEmptyData)) // optional
	.then((continentData) => clean.structureContinents(continentData))
	.then((allCategoryData) => clean.insertCategories(allCategoryData))
	.then((objectCount) => clean.amountOfObjects(objectCount))
	.then((objects) => clean.objectCount(objects))
	.then((totalObjects) => clean.totalObjects(totalObjects))
	.then((percentageOfCount) => clean.calcPercentage(percentageOfCount))
	.then((data) => clean.cleanedData(data))
	.then((cleanData) => {
		// console.log('ik wil dit zien', cleanData)
		// const data = [cleanData];
		const data = cleanData;
		console.log('data', data)
		
		const color = d3.scale.ordinal()
			.range(['#EDC951','#CC333F','#00A0B0', '#002533', '#4D5B23']);
		
		//Call function to draw the Radar chart
		radarChart('.radarChart', data, color);
	});
// .then((test) => console.log("test", test));