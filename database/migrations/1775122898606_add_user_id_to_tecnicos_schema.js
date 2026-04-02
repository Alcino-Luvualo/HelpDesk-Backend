'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddUserIdToTecnicosSchema extends Schema {
  up () {
    this.table('tecnicos', (table) => {
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
    })
  }

  down () {
    this.table('tecnicos', (table) => {
      table.dropColumn('user_id')
    })
  }
}

module.exports = AddUserIdToTecnicosSchema
