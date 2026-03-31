'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

class Cliente extends Model {
  static get hidden () {
    return ['password']
  }

  static boot () {
    super.boot()

    this.addHook('beforeSave', async (clienteInstance) => {
      if (clienteInstance.dirty.password) {
        clienteInstance.password = await Hash.make(clienteInstance.password)
      }
    })
  }

  chamados(){
    return this.hasMany('App/Models/Chamado')
  }

  getFotoUrl (fotoUrl) {
    if (!fotoUrl) return null
    // Ignorar URLs antigas do sistema local
    if (fotoUrl.startsWith('/uploads/')) return null
    return fotoUrl
  }
}

module.exports = Cliente
