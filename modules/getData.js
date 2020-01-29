const url = 'https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-33/sparql';

const prefix = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
                PREFIX dc: <http://purl.org/dc/elements/1.1/>
                PREFIX dct: <http://purl.org/dc/terms/>
                PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
                PREFIX edm: <http://www.europeana.eu/schemas/edm/>
                PREFIX foaf: <http://xmlns.com/foaf/0.1/>`
        
export default async function getData(query){
	let response = await fetch(url+'?query='+ encodeURIComponent(prefix + query) +'&format=json');
	let json = await response.json();
	return json.results.bindings;
}	