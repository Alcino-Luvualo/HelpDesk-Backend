'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Cliente extends Model {
  chamados(){
    return this.hasMany('App/Models/Cliente')
  }
}

module.exports = Cliente
