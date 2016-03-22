'use strict';

var ndm = require('node-data-mapper');

var db =
{
  name: 'INFORMATION_SCHEMA',
  tables:
  [
    {
      name: 'tables',
      columns:
      [
        {
          name: 'TABLE_NAME',
          isPrimary: true
        }
      ]
    },
    {
      name: 'columns',
      columns:
      [
        {
          name:      'COLUMN_NAME',
          isPrimary: true
        },
        {
          name: 'TABLE_NAME'
        },
        {
          name: 'DATA_TYPE'
        },
        {
          name: 'CHARACTER_MAXIMUM_LENGTH'
        },
        {
          name: 'IS_NULLABLE'
        }
      ]
    }
  ]
};

module.exports = db;

