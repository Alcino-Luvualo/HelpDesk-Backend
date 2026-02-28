'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddTituloToChamadosSchema extends Schema {
  up () {
    this.table('chamados', (table) => {
      table.string('titulo').nullable().after('id')
    })
  }

  down () {
    this.table('chamados', (table) => {
      table.dropColumn('titulo')
    })
  }
}

module.exports = AddTituloToChamadosSchema
