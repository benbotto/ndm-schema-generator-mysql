'use strict';

const events       = require('events');
const EventEmitter = events.EventEmitter;
const ndm          = require('node-data-mapper');

/**
 * Class that is used to generate a schema object for a database.
 */
class Generator extends EventEmitter {
  /**
   * Initialize the schema generator.
   * @param {Object} con - A MySQL connection (or connection pool) for the
   * INFORMATION_SCHEMA database.  The pool will be disconnected after
   * generating the schema.
   */
  constructor(pool) {
    super();

    // Set up the DataContext.
    const db = new ndm.Database(require('./information_schema'));
    this._infoSchemaDC = new ndm.MySQLDataContext(db, pool);
  }

  /**
   * Generate the schema from the database.
   * @param {string} dbName - The name of the database for which the schema
   * should be generated.
   * @return {Promise} A promise that shall be resolved with the generated
   * schema.
   */
  generateSchema(dbName) {
    // Get all the tables and columns from the information_schema db.
    const query = this._infoSchemaDC
      .from('TABLES t')
      .innerJoin({
        table:  'COLUMNS',
        parent: 't',
        as: 'c',
        on: {
          $and: [
            {$eq: {'t.TABLE_NAME':'c.TABLE_NAME'}},
            {$eq: {'t.TABLE_SCHEMA':'c.TABLE_SCHEMA'}}
          ]
        }
      })
      .leftOuterJoin({
        table: 'KEY_COLUMN_USAGE',
        as: 'fk',
        parent: 't',
        mapTo: 'foreignKeys',
        on: {
          $and: [
            {$eq: {'t.TABLE_NAME':'fk.TABLE_NAME'}},
            {$eq: {'t.TABLE_SCHEMA':'fk.TABLE_SCHEMA'}},
            {$eq: {'c.COLUMN_NAME':'fk.COLUMN_NAME'}},
            {$isnt: {'fk.REFERENCED_TABLE_NAME':null}},
          ]
        }
      })
      .leftOuterJoin({
        table: 'KEY_COLUMN_USAGE',
        as: 'r',
        parent: 'fk',
        mapTo: 'references',
        relType: 'single',
        on: {
          $and: [
            {$eq: {'t.TABLE_NAME':'r.TABLE_NAME'}},
            {$eq: {'t.TABLE_SCHEMA':'r.TABLE_SCHEMA'}},
            {$eq: {'c.COLUMN_NAME':'r.COLUMN_NAME'}},
            {$eq: {'fk.CONSTRAINT_NAME':'r.CONSTRAINT_NAME'}},
            {$isnt: {'r.REFERENCED_TABLE_NAME':null}},
          ]
        }
      })
      // Only BASE TABLE types are included.  Views, for example, are not
      // supported because they do not have primary keys.
      .where({
        $and: [
          {$eq: {'t.TABLE_SCHEMA':':schema'}},
          {$eq: {'t.TABLE_TYPE':':tableType'}}
        ]
      }, {schema: dbName, tableType: 'BASE TABLE'})
      .select('t.TABLE_NAME',
        'c.COLUMN_NAME', 'c.DATA_TYPE', 'c.COLUMN_TYPE', 'c.IS_NULLABLE',
        'c.CHARACTER_MAXIMUM_LENGTH', 'c.COLUMN_KEY', 'c.COLUMN_DEFAULT',
        {column: 'fk.CONSTRAINT_NAME', mapTo: 'name'},
        {column: 'fk.TABLE_NAME', mapTo: 'table'},
        {column: 'fk.COLUMN_NAME', mapTo: 'column'},
        {column: 'r.CONSTRAINT_NAME', mapTo: 'name'},
        {column: 'r.REFERENCED_TABLE_NAME', mapTo: 'table'},
        {column: 'r.REFERENCED_COLUMN_NAME', mapTo: 'column'})
      .orderBy('t.TABLE_NAME', 'c.COLUMN_NAME');

    //console.log(query.toString());

    return query
      .execute()
      .then(res => {
        // Emit events for each table and column so that the user has a chance
        // to modify them (add converters, alias, etc.).
        res.tables.forEach(table => {
          this.emit('ADD_TABLE', table);
          table.columns.forEach(col => this.emit('ADD_COLUMN', col, table));
        });

        return {
          name:   dbName,
          tables: res.tables
        };
      })
      .finally(() => this._infoSchemaDC.queryExecuter.pool.end());
  }
}

module.exports = Generator;

