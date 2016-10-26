'use strict';

const events       = require('events');
const EventEmitter = events.EventEmitter;

/**
 * Class that is used to generate a schema object for a database.
 */
class Generator extends EventEmitter {
  /**
   * Initialize the schema generator.
   * @param {DataContext} infoSchemaDC A DataContext instance with permission
   *        to read from the INFORMATION_SCHEMA table.
   */
  constructor(infoSchemaDC) {
    super();
    this._infoSchemaDC = infoSchemaDC;
  }

  /**
   * Generate the schema from the database.
   * @param {string} dbName The name of the database for which the schema should be
   *        generated.
   */
  generateSchema(dbName) {
    // Get all the tables and columns from the information_schema db.
    const query = this._infoSchemaDC
      .from('tables')
      .innerJoin({
        table:  'columns',
        parent: 'tables',
        on: {
          $and: [
            {$eq: {'tables.TABLE_NAME':'columns.TABLE_NAME'}},
            {$eq: {'tables.TABLE_SCHEMA':'columns.TABLE_SCHEMA'}}
          ]
        }
      })
      .where({$eq: {'tables.TABLE_SCHEMA':':schema'}}, {schema: dbName})
      .select('tables.TABLE_NAME', 'columns.COLUMN_NAME',
        'columns.DATA_TYPE', 'columns.COLUMN_TYPE',
        'columns.IS_NULLABLE', 'columns.CHARACTER_MAXIMUM_LENGTH',
        'columns.COLUMN_KEY', 'columns.COLUMN_DEFAULT')
      .orderBy('tables.TABLE_NAME', 'columns.COLUMN_NAME');

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
      .finally(() => this._infoSchemaDC.getQueryExecuter().getConnectionPool().end());
  }
}

module.exports = Generator;

