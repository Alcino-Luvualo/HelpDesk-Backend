'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddFotoToClientesSchema extends Schema {
  up () {
    this.table('clientes', (table) => {
      table.string('fotoUrl').nullable()
    })
  }

  down () {
    this.table('clientes', (table) => {
      table.dropColumn('fotoUrl')
    })
  }
}

module.exports = AddFotoToClientesSchema
