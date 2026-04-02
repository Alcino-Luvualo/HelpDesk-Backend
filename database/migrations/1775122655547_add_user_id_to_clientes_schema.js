'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddUserIdToClientesSchema extends Schema {
  up () {
    this.table('clientes', (table) => {
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
    })
  }

  down () {
    this.table('clientes', (table) => {
      table.dropColumn('user_id')
    })
  }
}

module.exports = AddUserIdToClientesSchema
