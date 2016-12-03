'use strict';

const ndm       = require('node-data-mapper');
const mysql     = require('mysql');
const schemaGen = require('ndm-schema-generator-mysql');
const db        = new ndm.Database(schemaGen.information_schema);
const pool      = mysql.createPool({
  host:            'localhost',
  user:            'example',
  password:        'secret',
  database:        db.name,
  connectionLimit: 1
});

module.exports = new ndm.MySQLDataContext(db, pool);

