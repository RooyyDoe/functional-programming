
const url = 'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-33/sparql';

const ContinentQuery = `
		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		PREFIX dc: <http://purl.org/dc/elements/1.1/>
		PREFIX dct: <http://purl.org/dc/terms/>
		PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
		PREFIX edm: <http://www.europeana.eu/schemas/edm/>
		PREFIX foaf: <http://xmlns.com/foaf/0.1/>

		SELECT ?superCategory  WHERE {
				<https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?superCategory .
		}`;

// const query2 = `
// 		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
// 		PREFIX dc: <http://purl.org/dc/elements/1.1/>
// 		PREFIX dct: <http://purl.org/dc/terms/>
// 		PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
// 		PREFIX edm: <http://www.europeana.eu/schemas/edm/>
// 		PREFIX foaf: <http://xmlns.com/foaf/0.1/>

// 		SELECT ?superCategory  WHERE {
// 				<https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?superCategory .
// 		}`;


runQuery(url, ContinentQuery)
	.then((rawContinentData) => cleanData(rawContinentData))
	.then((continentUriArray) => getCategories(continentUriArray))
	.then((checkResults) => convertArrayToObject(checkResults))
	.then((resultObject) => getCountOfCategory(resultObject))
	.then((testResult) => console.log(testResult))



// runs the query returns array with objects
async function runQuery(url, query){
	let response = await fetch(url+'?query='+ encodeURIComponent(query) +'&format=json');
	let json = await response.json();
	return json.results.bindings;
}	

// returns array with clean data
function cleanData(rawResults) {
	return rawResults.reduce((cleanResults, rawResult) => {
		for(let key in rawResult) {
			if (rawResult[key].datatype === "http://www.w3.org/2001/XMLSchema#integer") {
				let parsed = parseInt(rawResult[key].value, 10);
				cleanResults.push(parsed);
			} else cleanResults.push(rawResult[key].value);
		}
		return cleanResults;	
	},[]); 
}

// returns object with continentUri
function getCategories(continentUriArray) {
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
			.then((cleanCategoryData => combineContinentWithCategory(continentUriArray, cleanCategoryData)))
			.then((cleanResults) => resolve(cleanResults));
	});
}

function combineContinentWithCategory(continentUriArray, categoryUriArray) {
	return continentUriArray.reduce((newArray, continentUri) => {
		let pair = [continentUri, categoryUriArray];
		newArray.push(pair);
		return newArray;
	},[]);
}

function convertArrayToObject(combineResults) {
	return Object.fromEntries(combineResults);
}


// returns count
function getCountOfCategory(continentUriArray, categoryUriArray) {
	return new Promise(async(resolve) => {
		let totalResult = `
			PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
			PREFIX dc: <http://purl.org/dc/elements/1.1/>
			PREFIX dct: <http://purl.org/dc/terms/>
			PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
			PREFIX edm: <http://www.europeana.eu/schemas/edm/>
			PREFIX foaf: <http://xmlns.com/foaf/0.1/>

			SELECT ?categoryName (COUNT(?category) AS ?categoryAmount) WHERE {
				
				<${continentUriArray}> skos:narrower* ?continent .
					?obj dct:spatial ?continent .

				<${categoryUriArray}> skos:narrower* ?category .
					?obj edm:isRelatedTo ?category .
					?category skos:prefLabel ?categoryName .
				
		} GROUP BY ?categoryName`;

		runQuery(url, totalResult)
			.then((rawCountData) => cleanData(rawCountData))
			.then(test => resolve(test))
			// .then((cleanData) => countCategoryResults(cleanData))
			// .then((count) => resolve(count));
	});
}

function finalData(resultObject, getCountOfCategory) {
	for (let key in resultObject){
		let promises = [];

		resultObject[key].forEach((element) => {
			let promise = getCountOfCategory(key, element);
			promises.push(promise);
		});

		console.log(promises);

		Promise
			.all(promises)
			.then((array) => convertArrayToObject(array))
			.then((object) => { 
				console.log(object);
				console.log(resultObject[key]);
				resultObject[key] = object;
				// console.log(resultObject[key]);
			});

	}
}

function countCategoryResults(results) {
	return results.reduce((totalObjects, currentObjects) => {
		return totalObjects + currentObjects;
	});
}






function finalData(resultObject, getCountOfCategory) {
	for (let key in resultObject){
		let promises = [];

		resultObject[key].forEach((element) => {
			let promise = getCountOfCategory(key, element);
			promises.push(promise);
		});

		console.log(promises);

		Promise
			.all(promises)
			.then((array) => convertArrayToObject(array))
			.then((object) => { 
				console.log(object);
				console.log(resultObject[key]);
				resultObject[key] = object;
				// console.log(resultObject[key]);
			});

	}

// 	console.log(resultObject);
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







