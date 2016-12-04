# ndm-schema-generator-mysql

A tool to generate a database schema object for use with the [node-data-mapper](https://github.com/benbotto/node-data-mapper) project.

When using [node-data-mapper](https://github.com/benbotto/node-data-mapper) a database schema object is required to describe how each table and column will be mapped from a tablular format to a normalized format (from rows and columns to JavaScript objects and arrays).  Manually creating and maintaining a database schema object is cumbersome and error prone, so it's recommended that the database schema object be generated automatically at application start-up time.  After all, the database itself has metadata available that describes the tables, columns, data types, maximum lengths, nullability, etc.  Using a generator makes additions and modifications to the database automatic.  So if, for example, a column is added to the database, a simple application restart gives the ORM knowledge of the new column.  This tool provides a working example that can be used to generate a database schema object, with some useful hooks for aliasing tables and columns and attaching global converters.

### Table of Contents

- [Getting Started](#getting-started)
    - [Install ndm-schema-generator-mysql](#install-ndm-schema-generator-mysql)
- [Generate a Database Schema Object](#generate-a-database-schema-object)
    - [Example](#example)
    - [Add Table Event](#add-table-event)
    - [Add Column Event](#add-column-event)

### Getting Started

First off, if you're not familiar with [node-data-mapper](https://github.com/benbotto/node-data-mapper) then please read through the [Getting Started](https://github.com/benbotto/node-data-mapper#getting-started) section.

The below example uses a fictitious ```bike_shop``` database.  If you would like to run the example included in the example folder (```./example/index.js```), then first [follow the instructions](https://github.com/benbotto/node-data-mapper#examples) for creating the ```bike_shop``` database.

##### Install ndm-schema-generator-mysql

```bash
$ npm install ndm-schema-generator-mysql --save
```

### Generate a Database Schema Object

##### Example

Below is a quick example of how to generate a database schema object.  The example generates the schema object, performs some minor manipulation on the tables and columns, and then prints the results to the console.  There are two event handlers--```onAddTable``` and ```onAddColumn```--that are described in further detail below.

```JavaScript
'use strict';

const mysql                  = require('mysql');
const ndm                    = require('node-data-mapper');
const schemaGen              = require('ndm-schema-generator-mysql');
const MySQLSchemaGenerator   = schemaGen.MySQLSchemaGenerator;
const infoSchemaDB           = schemaGen.informationSchemaDatabase;
const util                   = require('util');

// Connect to the database.
const con = mysql.createConnection({
  host:     'localhost',
  user:     'example',
  password: 'secret',
  database: 'INFORMATION_SCHEMA'
});

// Create the Datacontext instance for the information_schema database.
const dataContext = new ndm.MySQLDataContext(infoSchemaDB, con);

// Create the MySQLSchemaGenerator instance.
const generator = new MySQLSchemaGenerator(dataContext);

// Handlers for the ADD_TABLE and ADD_COLUMN events.
generator.on('ADD_TABLE',  onAddTable);
generator.on('ADD_COLUMN', onAddColumn);

// Generate the schema.
generator
  .generateSchema('bike_shop')
  .then(schema => console.log(util.inspect(schema, {depth: null})))
  .catch(console.error);

/**
 * The table mapping (mapTo) removes any underscores and uppercases the
 * proceeding character.  Ex: bike_shop_bikes => bikeShopBikes
 * @param {Table} table - An ndm.Table instance with a name property.
 * @return {void}
 */
function onAddTable(table) {
  table.mapTo = table.name.replace(/_[a-z]/g, (c) => c.substr(1).toUpperCase());
}

/**
 * Set up each column.
 * @param {Column} col - An ndm.Column instance with name, mapTo, dataType,
 * columnType, isNullable, maxLength, and isPrimary properties.
 * @param {Table} table - An ndm.Table object with name and mapTo properties.
 * @return {void}
 */
function onAddColumn(col, table) {
  // Add a converter based on the type.
  if (col.dataType === 'bit')
    col.converter = ndm.bitConverter;
}

```

The ```generator.generateSchema``` takes a single ```dbName``` parameter, which is a string.

##### Add Table Event

For each table in the database, an ```ADD_TABLE``` event is broadcast, passing along a ```Table``` object describing the table.  This event allows for defining global mappings for tables.  In the example above, tables are defined in the database using snake_case (```bike_shops``` and ```bike_shop_bikes``` for example).  In JavaScript, however, the most common convention is camelCase.  Hence, the ```tableCB``` function above take in a ```table object``` with a ```name``` in snake_case, and modifies it to have a camelCase ```mapTo``` (mapping).

##### Add Column Event

Likewise, for each column in the database an ```ADD_COLUMN``` event is broadcast.  An event handler can be used to define custom column mappings, or to attached global converters based on data type.  In the example above, a ```bitConverter``` is attached to all ```bit```-type columns (in reality, this would most likely be attached to columns with a ```columnType``` of ```tinyint(1)``` as well).  At any rate, with the above definition in place every ```bit```-type column in the database will automatically be transformed into a boolean on retrieve, and from a boolean to a bit on save.  One could, for example, convert all dates to UTC strings, or perform other system-wide format changes.

