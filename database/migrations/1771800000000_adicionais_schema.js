'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AdicionaisSchema extends Schema {
  up () {
    this.create('adicionais', (table) => {
      table.increments()
      table.integer('chamado_id').unsigned().notNullable()
      table.foreign('chamado_id').references('id').inTable('chamados').onDelete('CASCADE')
      table.string('descricao').notNullable()
      table.decimal('valor', 10, 2).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('adicionais')
  }
}

module.exports = AdicionaisSchema
