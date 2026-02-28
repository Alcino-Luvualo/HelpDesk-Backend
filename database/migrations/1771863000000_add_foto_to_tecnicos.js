'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddFotoToTecnicosSchema extends Schema {
  up () {
    this.table('tecnicos', (table) => {
      table.string('fotoUrl').nullable()
    })
  }

  down () {
    this.table('tecnicos', (table) => {
      table.dropColumn('fotoUrl')
    })
  }
}

module.exports = AddFotoToTecnicosSchema
