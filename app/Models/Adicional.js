'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Adicional extends Model {
  static get table () {
    return 'adicionais'
  }

  chamado () {
    return this.belongsTo('App/Models/Chamado')
  }
}

module.exports = Adicional
