'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ChamadosSchema extends Schema {
  up () {
    this.create('chamados', (table) => {
      table.increments()
      table.text('descricao').notNullable()
      table.integer('servico_id').unsigned().notNullable()
      table.foreign('servico_id').references('id').inTable('servicos').onDelete('CASCADE')
      table.integer('cliente_id').unsigned().notNullable()
      table.foreign('cliente_id').references('id').inTable('clientes').onDelete('CASCADE')
      table.integer('tecnico_id').unsigned().notNullable()
      table.foreign('tecnico_id').references('id').inTable('tecnicos').onDelete('CASCADE')
      table.decimal('valor_adicional', 10, 2).defaultTo(0)
      table.text('descricao_adicional').nullable()
      table.enu('status', ['Aberto', 'Em atendimento', 'Encerrado']).defaultTo('Aberto')
      table.timestamps()
    })
  }

  down () {
    this.drop('chamados')
  }
}

module.exports = ChamadosSchema
