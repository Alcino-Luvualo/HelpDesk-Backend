'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Chamado extends Model {
  servico(){
    return this.belongsTo('App/Models/Servico')
  }
  tecnico(){
    return this.belongsTo('App/Models/Tecnico')
  }
  cliente(){
    return this.belongsTo('App/Models/Cliente')
  }
}

module.exports = Chamado
