'use strict';

var ndm   = require('node-data-mapper');
var mysql = require('mysql');
var db    = new ndm.Database(require('./mysql_information_schema'));
var pool  = mysql.createPool
({
  host:            'localhost',
  user:            'example',
  password:        'secret',
  database:        db.getName(),
  connectionLimit: 1
});

module.exports = new ndm.MySQLDataContext(db, pool);

