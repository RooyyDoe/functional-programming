# Functional Programming

(Explaination/concept)

The whole process of creating this application will all be documented in the [wiki](https://github.com/RooyyDoe/frontend-applications/wiki) of my repository.

## Screenshots

(Image)

![Imgur]()

## Assignment

Create a data visualisation with d3 based on given data.

## Interactions



## Installation

**Clone the repository of the project**
```
git clone https://github.com/RooyyDoe/functional-programming.git
```

**Npm packages installing**
```
npm install
```

### Usage

**Run code**
```
npm run dev
```

**Url for the application**

```
localhost:5000 // host is now available
```

(Live demo if needed)

**Demo** is also live at: https://frontend-applications-svelte.netlify.com/

## API
(API Call with explanation)

This API allows you to get data of different historical events. This can be for example historic objects or pictures from all over the world. We all have obtained an individual endpoint to substract certain data from this database. 

I made use of the following API:

* [GVN](https://data.netwerkdigitaalerfgoed.nl/)

<details>


```
	PREFIX dc: <http://purl.org/dc/elements/1.1/>
	PREFIX dct: <http://purl.org/dc/terms/>
	PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
	PREFIX edm: <http://www.europeana.eu/schemas/edm/>
	PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
	
	SELECT ?cho (SAMPLE(?title) AS ?uniqueTitle) (SAMPLE(?img) AS ?uniqueImage) (SAMPLE(?periode) AS ?uniquePeriod) (SAMPLE(?  herkomstLabel) AS ?uniqueHerkomstLabel) (SAMPLE(?jaartal) AS ?uniqueJaartal) WHERE {
	   <https://hdl.handle.net/20.500.11840/termmaster4400> skos:narrower* ?concept .
	   ?concept skos:prefLabel ?periode .
	   VALUES ?periode { "Edo (Japanse periode)" }
	  
	   ?cho dc:title ?title .
	   ?cho edm:isShownBy ?img .
	  
	   ?cho dct:created ?jaartal .
	   filter(xsd:integer(?jaartal) >= 1611 && xsd:integer(?jaartal) <= 1868)
	  
	   ?cho dct:spatial ?herkomst .
	   ?herkomst skos:prefLabel ?herkomstLabel .
	   VALUES ?herkomstLabel { "Japan" } .
	  
	   FILTER langMatches(lang(?title), "ned")
	} GROUP BY ?cho
```
</details>

In this query I am asking for different types of data. The most important data that I need from this database is the data from the time period 1611-1868, which is obtained with the filter **year period(jaartal)**. In this period I need every **Title** and **Image**. I am also filtering on the origin and period, so I want every object that is in this database that has the origin: 'Japan' and period: 'Edo (Japanse periode)'. 

At first I wanted to give a detailed explanation of all the different objects that resulted from this query. However, due to the lack of information for certain objects, this was not possible. A lot of the objects did not have any description or some information was simply missing. When the database is further developed, more details can always be added to the visualization. For now the application will only include the title, the year and the image of the objects. 

## Sources
* (Sources I got help from)

## Credits

* (People that helped me)

# License

More information over [License](https://help.github.com/en/articles/licensing-a-repository)

[MIT](https://github.com/RooyyDoe/functional-programming/blob/master/LICENSE.txt) © [Roy Kuijper](https://github.com/RooyyDoe)
