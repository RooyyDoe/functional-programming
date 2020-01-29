import getData from './getData.js';

export default {
	cleanData,
	filterEmptyResults,
	structureContinents,
	insertCategories,
	amountOfObjects,
	objectCount,
	totalObjects,
	calcPercentage,
	cleanedData

};

function structureContinents(mainData) {
	return mainData.map(uri => { return { uri }; } );
}

async function insertCategories(mainData) {
	let catArray = await getCategories();

	return mainData.map((continent) => {
		continent.categories = catArray;
		return continent;
	});
}

async function amountOfObjects(mainData) {
	// maps over continent of mainData and puts this in a variable
	let mainDataPromiseArray = mainData.map(async continent => { 
		// maps over continent.categories and puts this in a variable
		let categoriesPromiseArray = continent.categories.map(async categorie => { 
			// Invokes getCountOfCategory() and put all the results in count.
			let count = await getCountOfCategory(continent.uri, categorie.uri);
			// Returns two objects into continent.categories 
			// This will happen when the Promise.all has all the promises and
			// the override of continent.categories has happend.
			return {
				uri: categorie.uri,
				name: categorie.name,
				count: count
			};
	
		});
			// waits till all the promises are done and then puts them in a variable newCategories
		let newCategories = await Promise.all(categoriesPromiseArray);
		// Overrides continent.categories with the promises
		continent.categories = newCategories;
		// returns object
		return continent;
	});
		// waits till all the promises are done after the ones of categories and then puts them in newContinents
	let newContinents = await Promise.all(mainDataPromiseArray);
	// This is getting returned and there will be a list of arrays in the continent.array
	return newContinents;
	// After this I am going to make a object of the array.
}

function objectCount(mainData) {
	return mainData.map(continent => {
		continent.categories = continent.categories.map(category => {
			category.count = countCategoryResults(category.count);
			return category;
		}); 
		return continent;
	});
}

function totalObjects(mainData) {
	return mainData.map(continent => {
		let count = continent.categories.reduce((count, cur) => count += cur.count ,0);
		continent.count = count;
		return continent;
	});
}

function calcPercentage(mainData) {
	return mainData.map(continent => {
		continent.categories.forEach((category) => {
			category.percentage = category.count / continent.count; 
		});
		return continent;
	});
}

function cleanedData(mainData) {
	return mainData.map(continent => {
		const newArray = [];
		continent.categories = continent.categories.map(categories => {
			let obj = {
				axis: categories.name,
				value: categories.percentage
			};
			newArray.push(obj); 
		});
		return newArray;
	});
}

// Re-usable functions

function cleanCategoryData(rawResults) {
	return rawResults.reduce((cleanResults, rawResult) => {
		cleanResults.push({uri: rawResult.superCategory.value, name: rawResult.categoryName.value})
		return cleanResults;	
	},[]); 
	
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
		SELECT ?superCategory ?categoryName WHERE {
				<https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?superCategory .
				?superCategory skos:prefLabel ?categoryName .
		}`;

		getData(categoryQuery)
			// .then((data) => console.log(data))
			.then((rawCategoryData) => cleanCategoryData(rawCategoryData))
			// .then((cleanCategoryData => combineContinentWithCategory(continentUriArray, cleanCategoryData)))
			.then((cleanResults) => resolve(cleanResults));
	});
}

function getCountOfCategory(continentUri, categoryUri) {
	return new Promise(async(resolve) => {
		let totalResult = `
			SELECT (COUNT(?category) AS ?categoryAmount) WHERE {
				
				<${continentUri}> skos:narrower* ?continent .
					?obj dct:spatial ?continent .
				<${categoryUri}> skos:narrower* ?category .
					?obj edm:isRelatedTo ?category .
					?category skos:prefLabel ?categoryName .
				
		} GROUP BY ?categoryName`;

		getData(totalResult)
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