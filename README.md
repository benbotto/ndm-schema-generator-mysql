# ndm-schema-generator

A tool to generate a database schema object for use with the [node-data-mapper](https://github.com/benbotto/node-data-mapper) project.

When using [node-data-mapper](https://github.com/benbotto/node-data-mapper) a database schema object is required to describe how each table and column will be mapped from a tablular format to a normalized format (from rows and columns to JavaScript objects and arrays).  Manually creating and maintaining a database schema object is cumbersome and error prone, so it's recommended that the database schema object be generated automatically at application start-up time.  After all, the database itself has metadata available that describes the tables, columns, datatypes, maximum lengths, nullability, etc.  This tool provides a working example that can be used to generate a database schema object, with some useful hooks for aliasing tables and columns and attaching global converters.

### Table of Contents

- [Getting Started](#getting-started)
    - [Install ndm-schema-generator](#install-ndm-schema-generator)
    - [Create a DataContext Instance](#create-a-datacontext-instance)
- [Examples](#examples)

### Getting Started

First off, if you're not familiar with [node-data-mapper](https://github.com/benbotto/node-data-mapper) then please read through the [Getting Started](https://github.com/benbotto/node-data-mapper#getting-started) section.  The ndm-schema-generator is implemented in terms of node-data-mapper, and the initial setup is therefore similar.

##### Install ndm-schema-generator

```bash
$ npm install ndm-schema-generator --save
```

##### Create a DataContext Instance

After installation, a DataContext instance needs to be set up.  This file provides connection details for your database.  The supplied user must have access to the INFORMATION_SCHEMA database, as it's what is queried to retrieve metadata about your database and subsequently generate the database schema object.  Here's an example DataContext file (reference ```example/infoSchemaDataContext.js```):

```JavaScript
'use strict';

let ndm   = require('node-data-mapper');
let mysql = require('mysql');
let db    = new ndm.Database(require('ndm-schema-generator').information_schema);
let pool  = mysql.createPool({
  host:            'localhost',
  user:            'example',
  password:        'secret',
  database:        db.getName(),
  connectionLimit: 1
});

module.exports = new ndm.MySQLDataContext(db, pool);
```
