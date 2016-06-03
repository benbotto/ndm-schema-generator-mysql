'use strict';

var ndm          = require('node-data-mapper');
var Generator    = require('ndm-schema-generator').Generator;
var infoSchemaDC = require('./infoSchemaDataContext');
var generator    = new Generator(infoSchemaDC);

/**
 * The table alias removes any underscores and uppercases the proceeding
 * character.  Ex: bike_shop_bikes => bikeShopBikes
 */
function tableCB(table)
{
  table.alias = table.name.replace(/_[a-z]/g, (c) => c.substr(1).toUpperCase());
}

/**
 * Set up each column.
 */
function columnCB(col, table)
{
  // Add a converter based on the type.
  if (col.dataType === 'bit')
    col.converter = ndm.bitConverter;
}

generator
  .generateSchema('bike_shop', tableCB, columnCB)
  .then(console.log)
  .catch(console.error);

