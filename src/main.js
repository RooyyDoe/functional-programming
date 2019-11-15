import radarChart from './models/radarChart.js';

const url = 'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-33/sparql';

const ContinentQuery = `
		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		PREFIX dc: <http://purl.org/dc/elements/1.1/>
		PREFIX dct: <http://purl.org/dc/terms/>
		PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
		PREFIX edm: <http://www.europeana.eu/schemas/edm/>
		PREFIX foaf: <http://xmlns.com/foaf/0.1/>

		SELECT ?continents  WHERE {
				<https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?continents .
		}`;

runQuery(url, ContinentQuery)
	.then((rawContinent) => cleanData(rawContinent))
	.then((filteringEmptyData) => filterEmptyResults(filteringEmptyData)) // optional
	.then((mainData) => mainData.map(uri => {
		return {uri: uri}
	}))
	.then(async (mainData) => {
		let catArray = await getCategories();

		return mainData.map((continent) => {
			continent.categories = catArray;
			return continent;
		});
	})
	.then((mainData)=> mainData.map(continent => {

		continent.categories = continent.categories.map(uri => {
			return {uri: uri};
		}); 
		return continent;
	}))
	.then(async (mainData) => {
	
		let mainDataPromiseArray = mainData.map(async continent => {

			let categoriesPromiseArray = continent.categories.map(async categorie => {
				let count = await getCountOfCategory(continent.uri, categorie.uri);
				return {
					uri: categorie.uri,
					count: count
				};
	
			});

			let newCategories = await Promise.all(categoriesPromiseArray);

			continent.categories = newCategories;

			return continent;
		});

		let newContinents = await Promise.all(mainDataPromiseArray);

		return newContinents;

	})
	.then((mainData) => mainData.map(continent => {
		// continent.categories.count = countCategoryResults(continent.categories.count);
		continent.categories = continent.categories.map(category => {
			category.count = countCategoryResults(category.count);
			return category;
		}); 
		return continent;
	}))
	.then((mainData) => mainData.map(continent => {
		let sum = 0;
		for (let i = 0; i < continent.categories.length; i++) {
			sum = continent.categories[i].count + sum;

		}
		return {
			categories: continent.categories,
			uri: continent.uri,
			count: sum
		};
	}))
	.then((mainData) => mainData.map(continent => {
		for (let i = 0; i < continent.categories.length; i++) {
			continent.categories[i].percentage = continent.categories[i].count / continent.count;
		}	
		continent.categories = continent.categories.map(categories => {
			return {
				uri: categories.uri,
				count: categories.count,
				percentage: categories.percentage
			};
		
		});
		return continent;
	}))
	.then((mainData) => mainData.map(continent => {
		const newArray = [];
		continent.categories = continent.categories.map(categories => {
			let obj = {
				axis: categories.uri,
				value: categories.percentage
			};
			newArray.push(obj); 
		});
		return newArray;	
	}))
	// .then((mainData)=> console.log(mainData))
	.then((cleanData) => {
		// console.log('ik wil dit zien', cleanData)
		// const data = [cleanData];
		const data = cleanData;
		console.log('data', data)
		
		
		const margin = {top: 100, right: 100, bottom: 100, left: 100},
			width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
			height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
		
		const color = d3.scale.ordinal()
			.range(['#EDC951','#CC333F','#00A0B0', '#002533', '#4D5B23']);
		
		const radarChartOptions = {
			w: width,
			h: height,
			margin: margin,
			maxValue: 0.5,
			levels: 7,
			color: color
		};
		//Call function to draw the Radar chart
		radarChart('.radarChart', data, radarChartOptions);
	});
	





///////////////////  Functions  ///////////////////////	

async function runQuery(url, query){
	let response = await fetch(url+'?query='+ encodeURIComponent(query) +'&format=json');
	let json = await response.json();
	return json.results.bindings;
}	

function cleanData(rawResults) {
	return rawResults.reduce((cleanResults, rawResult) => {
		for(let key in rawResult) {
			if (rawResult[key].datatype === 'http://www.w3.org/2001/XMLSchema#integer') {
				let parsed = parseInt(rawResult[key].value, 10);
				cleanResults.push(parsed);
			} else cleanResults.push(rawResult[key].value);
		}
		return cleanResults;	
	},[]); 
	
}

function filterEmptyResults(emptyResults) {
	return emptyResults.slice(3,8);
}

function getCategories() {
	return new Promise(async(resolve) => {
		const categoryQuery = `
		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		PREFIX dc: <http://purl.org/dc/elements/1.1/>
		PREFIX dct: <http://purl.org/dc/terms/>
		PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
		PREFIX edm: <http://www.europeana.eu/schemas/edm/>
		PREFIX foaf: <http://xmlns.com/foaf/0.1/>

		SELECT ?superCategory  WHERE {
				<https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?superCategory .
		}`;

		runQuery(url, categoryQuery)
			.then((rawCategoryData) => cleanData(rawCategoryData))
			// .then((cleanCategoryData => combineContinentWithCategory(continentUriArray, cleanCategoryData)))
			.then((cleanResults) => resolve(cleanResults));
	});
}


function getCountOfCategory(continentUri, categoryUri) {
	return new Promise(async(resolve) => {
		let totalResult = `
			PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
			PREFIX dc: <http://purl.org/dc/elements/1.1/>
			PREFIX dct: <http://purl.org/dc/terms/>
			PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
			PREFIX edm: <http://www.europeana.eu/schemas/edm/>
			PREFIX foaf: <http://xmlns.com/foaf/0.1/>

			SELECT (COUNT(?category) AS ?categoryAmount) WHERE {
				
				<${continentUri}> skos:narrower* ?continent .
					?obj dct:spatial ?continent .

				<${categoryUri}> skos:narrower* ?category .
					?obj edm:isRelatedTo ?category .
					?category skos:prefLabel ?categoryName .
				
		} GROUP BY ?categoryName`;

		runQuery(url, totalResult)
			.then((rawCountData) => cleanData(rawCountData))
			// .then((countUpData) => countCategoryResults(countUpData))
			.then((countResults) => resolve(countResults));
		// .then((cleanCountData => combineCountWithCategory(continentUriArray, cleanCategoryData)))
		// .then((cleanResults) => resolve(cleanResults));
	});
}

function countCategoryResults(results) {
	return results.reduce((a, b) => a + b, 0);
}

// function convertArrayToObject(combineResults) {
//	console.log(combineResults);

// 	return Object.fromEntries(combineResults);
// }

// function combineContinentWithCategory(continentUriArray, categoryUriArray) {
// 	return continentUriArray.reduce((newArray, continentUri) => {
// 		let pair = [continentUri, categoryUriArray];
// 		newArray.push(pair);
// 		return newArray;
// 	},[]);
// }


// (async () => {
// 	// makes variables with rawData results of continent and categories
// 	let rawCategoryResults = await runQuery(url,query);
// 	let rawContinentResults = await runQuery(url,query2);

// 	// let rawCategoryTotalResults = await runQuery(url,query3);
	
// 	// let cleanCategoryCount = cleanData(rawCategoryTotalResults);
// 	// let totalResults = countCategoryResults(cleanCategoryCount);
// 	// console.log(totalResults);

// 	// A variable with cleaned data to use in the further cleaning process.
// 	let cleanedContinentResults = cleanData(rawContinentResults);
// 	let cleanedCategories = cleanData(rawCategoryResults);

// 	// console.log(cleanData(rawCategoryResults));
// 	// console.log(cleanData(rawContinentResults));
// 	// console.log(cleanData(rawCategoryTotalResults));
	
// 	cleanedContinentResults.forEach(async continentUri => {
// 		cleanedCategories.forEach(async categoryUri => {
// 			let catQuery = `
// 				PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
// 				PREFIX dc: <http://purl.org/dc/elements/1.1/>
// 				PREFIX dct: <http://purl.org/dc/terms/>
// 				PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
// 				PREFIX edm: <http://www.europeana.eu/schemas/edm/>
// 				PREFIX foaf: <http://xmlns.com/foaf/0.1/>
	
// 				SELECT ?categoryName (COUNT(?category) AS ?categoryAmount) WHERE {
					
// 					<${continentUri}> skos:narrower* ?continent .
// 						?obj dct:spatial ?continent .
	
// 					<${categoryUri}> skos:narrower* ?category .
// 						?obj edm:isRelatedTo ?category .
// 						?category skos:prefLabel ?categoryName .
					
// 			} GROUP BY ?categoryName`;
// 			let catResults = await runQuery(url, catQuery );
// 			let cleanResult = cleanData(catResults);
// 			if (cleanResult.length > 5) {
// 				let finalCatResult = countCategoryResults(cleanResult);
// 				console.log(`Continent ${continentUri} has ${finalCatResult} in categorie ${categoryUri}`);
// 			}
// 		});
// 	});

// })();







