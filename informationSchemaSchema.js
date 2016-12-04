'use strict';

require('insulin').factory('ndm_informationSchemaSchema', ndm_informationSchemaSchemaProducer);

function ndm_informationSchemaSchemaProducer() {
  return {
    name: 'INFORMATION_SCHEMA',
    tables: [
      {
        name: 'TABLES',
        mapTo: 'tables',
        columns: [
          {
            name: 'TABLE_NAME',
            mapTo: 'name',
            isPrimary: true
          },
          {
            name: 'TABLE_SCHEMA'
          },
          {
            name: 'TABLE_TYPE'
          }
        ]
      },
      {
        name: 'COLUMNS',
        mapTo: 'columns',
        columns: [
          {
            name: 'COLUMN_NAME',
            mapTo: 'name',
            isPrimary: true
          },
          {
            name: 'TABLE_NAME'
          },
          {
            name: 'TABLE_SCHEMA'
          },
          {
            name: 'DATA_TYPE',
            mapTo: 'dataType'
          },
          {
            name: 'COLUMN_TYPE',
            mapTo: 'columnType'
          },
          {
            name: 'CHARACTER_MAXIMUM_LENGTH',
            mapTo: 'maxLength'
          },
          {
            name: 'IS_NULLABLE',
            mapTo: 'isNullable',
            converter: {
              onRetrieve: function(val) {
                return val === 'YES';
              }
            }
          },
          {
            name: 'COLUMN_KEY',
            mapTo: 'isPrimary',
            converter: {
              onRetrieve: function(val) {
                return val === 'PRI';
              }
            }
          },
          {
            name: 'COLUMN_DEFAULT',
            mapTo: 'defaultValue'
          }
        ]
      },
      {
        name: 'KEY_COLUMN_USAGE',
        mapTo: 'foreignKeys',
        columns: [
          {
            name: 'CONSTRAINT_NAME',
            mapTo: 'constraintName',
            isPrimary: true
          },
          {
            name: 'TABLE_NAME',
            mapTo: 'tableName'
          },
          {
            name: 'TABLE_SCHEMA',
            mapTo: 'tableSchema'
          },
          {
            name: 'COLUMN_NAME',
            mapTo: 'columnName'
          },
          {
            name: 'REFERENCED_TABLE_NAME',
            mapTo: 'referencedTableName'
          },
          {
            name: 'REFERENCED_COLUMN_NAME',
            mapTo: 'referencedColumnName'
          }
        ]
      }
    ]
  };
}

