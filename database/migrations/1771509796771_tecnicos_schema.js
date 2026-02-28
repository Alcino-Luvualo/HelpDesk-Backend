'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TecnicosSchema extends Schema {
  up () {
    this.create('tecnicos', (table) => {
      table.increments()
      table.string('fullName').notNullable()
      table.string('email').notNullable().unique()
      table.json('disponibilidades').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('tecnicos')
  }
}

module.exports = TecnicosSchema
