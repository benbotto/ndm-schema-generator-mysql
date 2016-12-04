'use strict';

require('insulin').factory('ndm_informationSchemaDatabase',
  ['ndm_informationSchemaSchema', 'ndm_Database'],
  ndm_informationSchemaDatabaseProducer);

function ndm_informationSchemaDatabaseProducer(schema, Database) {
  return new Database(schema);
}

