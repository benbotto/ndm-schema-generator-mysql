'use strict';

var columnsDC = require('./columnsDataContext');
var query = columnsDC
  .from('tables')
  .innerJoin({table: 'columns', on: {$eq: {'tables.TABLE_NAME':'columns.TABLE_NAME'}}})
  .select()
  .orderBy('tables.TABLE_NAME', 'columns.COLUMN_NAME');

query.execute()
  .then(function(res)
  {
    console.log('Result');
    console.log(res);
  })
  .catch(function(err)
  {
    console.log('Error');
    console.log(err);
  })
  .finally(function()
  {
    console.log('Closing.');
    columnsDC.getQueryExecuter().getConnectionPool().end();
  });


/*
var mysql = require('mysql');

var connection = mysql.createConnection
({
  host:      'localhost',
  user:      'example',
  password:  'secret',
  database : 'bike_shop'
});

var query =
  'SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE ' +
  'FROM INFORMATION_SCHEMA.COLUMNS ' +
  "WHERE TABLE_SCHEMA = 'bike_shop' " +
  'ORDER BY TABLE_NAME, COLUMN_NAME';

connection.connect();

try
{
  connection.query(query, function(err, result)
  {
    if (err)
    {
      console.log('Error');
      console.log(err);
    }
    else
    {
      console.log('Result');
      console.dir(result);
    }
  });
}
catch (ex)
{
  console.log('Exception');
  console.log(ex);
}
finally
{
  console.log('Disconnecting');
  connection.end();
}
*/

