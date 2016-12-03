'use strict';

const ndm   = require('node-data-mapper');
const mysql = require('mysql');

//const db   = new ndm.Database(require('ndm-schema-generator').information_schema);
const db   = new ndm.Database(require('../information_schema'));
const pool = mysql.createPool({
  host:            'localhost',
  user:            'example',
  password:        'secret',
  database:        db.name,
  connectionLimit: 1
});

module.exports = new ndm.MySQLDataContext(db, pool);

