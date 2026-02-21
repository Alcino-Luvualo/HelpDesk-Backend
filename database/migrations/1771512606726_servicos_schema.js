'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ServicosSchema extends Schema {
  up () {
    this.create('servicos', (table) => {
      table.increments()
      table.string('titulos').notNullable()
      table.string('categoria').notNullable()
      table.decimal('valor_total').notNullable()
      table.boolean('estado').defaultTo(true)
      table.timestamps()
    })
  }

  down () {
    this.drop('servicos')
  }
}

module.exports = ServicosSchema
