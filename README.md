# Functional Programming

I want to show for all the categories how the objects are distributed over the continents within a certain category. To do this I want to create an overview that shows all the main categories in a radar chart. In this chart I want to make five circular grid types displaying the amount of objects in percentage within a category. The continents will be displayed as different chart layers where each continent has a different color. The chart will make use of interactive styles such as filtering on the different categories or continents, but also annotating will be used in this chart to provide more information about the exact value of the percentage and the difference between the continents.

The whole process of creating this application will all be documented in the [wiki](https://github.com/RooyyDoe/functional-programming/wiki) of my repository.

## Screenshots

![Petal_Chart_Dark_Design_Grad_1](https://user-images.githubusercontent.com/40355914/68203378-ef4dbc00-ffc5-11e9-9a89-f38cf4e6d6b2.png)


**Uiteindelijke versie**
![]()

- [Functional Programming](#functional-programming)
  - [Screenshots](#screenshots)
  - [Resit](#resit)
  - [Assignment](#assignment)
  - [Interaction](#interaction)
  - [Installation](#installation)
    - [Usage](#usage)
    - [API](#api)
  - [Sources](#sources)
  - [Credits](#credits)
- [License](#license)

## Resit

The assignments that I needed to do for my resit: 
* Making clean `.then` chain [explained](https://github.com/RooyyDoe/functional-programming/wiki/Resit-Functional-Cleaning)
* Add ES6 Modules in my project [explained](https://github.com/RooyyDoe/functional-programming/wiki/ES6-Modules), [in depth](https://github.com/RooyyDoe/functional-programming/wiki/Resit-Functional-Cleaning)
* Changing my `For` loop functions into ES6 [explained](https://github.com/RooyyDoe/functional-programming/wiki/Resit-Functional-Cleaning)
* Getting all the names of the categories [explained](https://github.com/RooyyDoe/functional-programming/wiki/Resit-Functional-Cleaning)
* Documenting ES6 Modules and d3.js

## Assignment

The assignment was to create a data visualisation with d3 based on given data.

To take a look at my cleaning process, you need to follow the following [Cleaning Link](https://github.com/RooyyDoe/functional-programming/wiki/Cleaning-data)

## Interactions

- [ ] User is going to be able to **hover** over the continents and they will be highlighted when the cursor is hovering on the element.
- [ ] User is going to be able to **filter** the chart by using the legenda.
- [ ] User is going to be able to see **annotations** when they click on the main categories.
- [ ] User is going to be able to **compare** two continents with each other by selecting them.

## Installation

**Clone the repository of the project**
```
git clone https://github.com/RooyyDoe/functional-programming.git
```

### Usage

**Run code**
```
Run the index.html into your browser
```

(Live demo if needed)

**Demo** is also live at: https://rooyydoe.github.io/functional-programming/

### API
(API Call with explanation)

This API allows you to get data of different historical events. This can be for example historic objects or pictures from all over the world. We all have obtained an individual endpoint to substract certain data from this database. 

I made use of the following API:

* [GVN](https://data.netwerkdigitaalerfgoed.nl/)

<details>

The first query I made was the one where I asked for all the continents that are available in the database. When this query runs it will show every continent that is available in the collection database.

```

//First Query for continents
SELECT ?continent  WHERE {
  <https://hdl.handle.net/20.500.11840/termmaster2> skos:narrower ?continent .
}

```

<img width="1152" alt="Schermafdruk 2019-11-08 11 09 13" src="https://user-images.githubusercontent.com/40355914/68468585-9aee4a80-0218-11ea-90b6-bc101d0608bc.png">

After this query I needed to get all the main categories that are available in the database. For this I used the thesaurus [Functionele Category](https://hdl.handle.net/20.500.11840/termmaster2802) and get all the narrower tags from this.

```

//Second Query for all the main categories
SELECT ?categoryName ?mainCategory  WHERE {
  <https://hdl.handle.net/20.500.11840/termmaster2802> skos:narrower ?mainCategory .
  ?mainCategory skos:prefLabel ?categoryName .
}

```

<img width="1151" alt="Schermafdruk 2019-11-08 11 18 12" src="https://user-images.githubusercontent.com/40355914/68468972-7646a280-0219-11ea-927f-6d9f3f5aa98c.png">

For my concept I need to get a count of all the objects that are linked to the continent and in that continent to the main category.

```

//Last query to get a total count of the objects
SELECT ?categoryName (COUNT(?category) AS ?categoryAmount) WHERE {
  
       <https://hdl.handle.net/20.500.11840/termmaster3> skos:narrower* ?continent .
  	   ?obj dct:spatial ?continent .
  
  	   <https://hdl.handle.net/20.500.11840/termmaster2803> skos:narrower* ?category .
       ?obj edm:isRelatedTo ?category .
  	   ?category skos:prefLabel ?categoryName .
  	   
} GROUP BY ?categoryName

```

<img width="1154" alt="Schermafdruk 2019-11-08 11 26 15" src="https://user-images.githubusercontent.com/40355914/68469502-975bc300-021a-11ea-8095-39bbacaa6e61.png">

</details>

I had to make multiple queries to get the exact data that I needed for my concept. My idea was to clean the query data in javascript and add the results all back together so I could use it for the D3 library.

## Sources
* [Mozilla Developer Network](https://developer.mozilla.org/en-US/) - I mostly used this site to obtain my sources
* [D3](https://d3js.org/) - This source I will mostly use for d3 related problems
* [D3 In Depth](https://www.d3indepth.com/) - This source goes deeper into the D3 possibilities
* [Remaining Sources](https://github.com/RooyyDoe/functional-programming/wiki/Remaining-Sources) - My remaining sources can be found at this page and I will also add the real sources and not global ones.

## Credits

* [Help from Thijs Spijker](https://github.com/iSirThijs) - Helped me with cleaning my data and explained different high-order functions. Next to this Thijs is still a good guy to talk with about problems you come across and he will always be there to help you out.
* [Help from Wessel Smit](https://github.com/WesselSmit) — Wessel helped me with my concept and is also a good guy that you can ask for help when having certain programming problems and he will give his opinion and explain how he would fix the problem.
* [Help from Stefan Gerrits](https://github.com/StefanGerrits2) — We did a lot of programming together and looked at each others code to fix certain things.
* [Help from Sjors Eveleens](https://github.com/Choerd) - He helped me look at my project in a different way when I was thinking way to difficult. He also gave me an option how I could turn my arrays into objects what helped me a lot.

# License

More information over [License](https://help.github.com/en/articles/licensing-a-repository)

[MIT](https://github.com/RooyyDoe/functional-programming/blob/master/LICENSE.txt) © [Roy Kuijper](https://github.com/RooyyDoe)
