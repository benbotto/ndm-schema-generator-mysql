'use strict';

const ndm          = require('node-data-mapper');
const Generator    = require('ndm-schema-generator').Generator;
const infoSchemaDC = require('./infoSchemaDataContext');
const util         = require('util');
const generator    = new Generator(infoSchemaDC);

/**
 * The table alias removes any underscores and uppercases the proceeding
 * character.  Ex: bike_shop_bikes => bikeShopBikes
 * @param table A Table object with name and alias properties.
 */
function onAddTable(table) {
  table.alias = table.name.replace(/_[a-z]/g, (c) => c.substr(1).toUpperCase());
}

/**
 * Set up each column.
 * @param col A Column object with name, alias, dataType, columnType,
 *        isNullable, maxLength, and isPrimary properties.
 * @param table A Table object with name and alias properties.
 */
function onAddColumn(col, table) {
  // Add a converter based on the type.
  if (col.dataType === 'bit')
    col.converter = ndm.bitConverter;
}

generator.on('ADD_TABLE',  onAddTable);
generator.on('ADD_COLUMN', onAddColumn);

generator
  .generateSchema('bike_shop')
  .then(schema => console.log(util.inspect(schema, {depth: null})))
  .catch(console.error);

