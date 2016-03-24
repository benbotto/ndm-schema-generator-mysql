'use strict';

var pluralize    = require('pluralize');
var util         = require('util');
var infoSchemaDC = require('./infoSchemaDataContext');
var dbName       = 'bike_shop';

// Get all the tables and columns from the information_schema db.
var query = infoSchemaDC
  .from('tables')
  .innerJoin
    ({
      table:  'columns',
      parent: 'tables',
      on:
      {
        $and:
        [
          {$eq: {'tables.TABLE_NAME':'columns.TABLE_NAME'}},
          {$eq: {'tables.TABLE_SCHEMA':'columns.TABLE_SCHEMA'}}
        ]
      }
    })
  .where({$eq: {'tables.TABLE_SCHEMA':':schema'}}, {schema: dbName})
  .select('tables.TABLE_NAME', 'columns.COLUMN_NAME', 'columns.DATA_TYPE', 'columns.IS_NULLABLE', 'columns.CHARACTER_MAXIMUM_LENGTH')
  .orderBy('tables.TABLE_NAME', 'columns.COLUMN_NAME');

//console.log(query.toString());

query.execute()
  .then(function(res)
  {
    // Build the schema.
    var database    = {};
    database.name   = dbName;
    database.tables = [];

    res.tables.forEach(function(table)
    {
      var tblAliasSing;

      // The table alias removes any underscores and uppercases the proceeding
      // character.  Ex: bike_shop_bikes => bikeShopBikes
      table.alias = table.name.replace(/_[a-z]/g, (c) => c.substr(1).toUpperCase());

      // Singular version of the table alias.
      tblAliasSing = pluralize(table.alias, 1);

      table.columns.forEach(function(col)
      {
        // The table alias is removed from any columns.  For example, bike_shops.bikeShopID
        // becomes bikeShops.ID.
        col.alias = col.name.replace(tblAliasSing, '');

        if (col.alias !== 'ID')
          col.alias = col.alias.replace(/^[A-Z]/, (c) => c.toLowerCase());
      });

      database.tables.push(table);
    });
    //console.log(util.inspect(res, {depth: null}));
    console.log(util.inspect(database, {depth: null}));
  })
  .catch(function(err)
  {
    console.log('Error');
    console.log(err);
  })
  .finally(function()
  {
    infoSchemaDC.getQueryExecuter().getConnectionPool().end();
  });

