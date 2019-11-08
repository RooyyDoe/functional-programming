// Const variable with the API endpoint in it.
const url = 'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-33/sparql';

// Const variable with a query from sparQL in it.
const query = `
		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		PREFIX dc: <http://purl.org/dc/elements/1.1/>
		PREFIX dct: <http://purl.org/dc/terms/>
		PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
		PREFIX edm: <http://www.europeana.eu/schemas/edm/>
		PREFIX foaf: <http://xmlns.com/foaf/0.1/>

		SELECT ?superCategory  WHERE {
				<https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?superCategory .
		}`;

// Const variable with a query from sparQL in it.
const query2 = `
		PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
		PREFIX dc: <http://purl.org/dc/elements/1.1/>
		PREFIX dct: <http://purl.org/dc/terms/>
		PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
		PREFIX edm: <http://www.europeana.eu/schemas/edm/>
		PREFIX foaf: <http://xmlns.com/foaf/0.1/>

		SELECT ?superCategory  WHERE {
				<https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?superCategory .
        }`;

(async () => {
	// makes variables with rawData results of continent and categories
	let rawCategoryResults = await runQuery(url,query);
	let rawContinentResults = await runQuery(url,query2);
        
	// let rawCategoryTotalResults = await runQuery(url,query3);
            
	// let cleanCategoryCount = cleanData(rawCategoryTotalResults);
	// let totalResults = countCategoryResults(cleanCategoryCount);
	// console.log(totalResults);
        
	// A variable with cleaned data to use in the further cleaning process.
	let cleanedContinentResults = cleanData(rawContinentResults);
	let cleanedCategories = cleanData(rawCategoryResults);
        
	// console.log(cleanData(rawCategoryResults));
	// console.log(cleanData(rawContinentResults));
	// console.log(cleanData(rawCategoryTotalResults));
            
	// foreach that loops over all the cleaned continent results
	cleanedContinentResults.forEach(async continentUri => {
		// foreach that loops over all the cleaned category results
		cleanedCategories.forEach(async categoryUri => {
			// Using template literals to put the results of the foreach into the query
			let catQuery = `
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
			// Variable with the results of the query that I made with the template literals
			let catResults = await runQuery(url, catQuery );
			// Cleaning the catQuery with my cleaning function
			let cleanResult = cleanData(catResults);
			// If the result length is bigger than 0 it will put it into a variable that counts up the
			// results
			if (cleanResult.length > 0) {
				let finalCatResult = countCategoryResults(cleanResult);
				// Presentation of what I have right now. with template literals.
				console.log(`Continent ${continentUri} has ${finalCatResult} in categorie ${categoryUri}`);
			}
		});
	});
        
})();

// This async function will get all the data out of the database.
async function runQuery(url, query){
	// This will fetch the URL/Query and get the json data and put it in a response
	let response = await fetch(url+'?query='+ encodeURIComponent(query) +'&format=json');
	// when the response happened it will get turned to json and put in another variable
	let json = await response.json();
	// Here you return the rawData so it can be used out of the async function.
	return json.results.bindings;
}

// This function will clean up the rawData results.
function cleanData(rawResults) {
	// Using the reduces function to go through every result of the rawData. and make a new 
	// array of it.
	return rawResults.reduce((cleanResults, rawResult) => {
		// looping through key of the results
		for(let key in rawResult) {
			// if the datatype is an integer it will use a parseInt to make the value a real
			// Integer. and after that pushes it to cleanResults.
			if (rawResult[key].datatype === "http://www.w3.org/2001/XMLSchema#integer") {
				let parsed = parseInt(rawResult[key].value, 10);
				cleanResults.push(parsed);
			// Pushes the results into cleanResults
			} else cleanResults.push(rawResult[key].value);
		}
		// return results so it can be used outside the function
		return cleanResults;	
	// initial value (array with all the new data)
	},[]); 
}

// Function that counts up all the sub category objects and gives back one total number
function countCategoryResults(results) {
	// Reduce with an accumulator and the current The returned value will 
	// be in current and it will get count up by the totalObject, like a foreach
	return results.reduce((totalObjects, currentObjects) => {
		// returns totalObject add up by currentObjects
		return totalObjects + currentObjects;
	});
}