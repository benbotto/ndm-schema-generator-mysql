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

