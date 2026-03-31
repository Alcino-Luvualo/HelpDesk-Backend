'use strict'

const crypto = require('crypto')

const Cliente = use('App/Models/Cliente')
const Tecnico = use('App/Models/Tecnico')

class ProfileIdentityService {
  buildLegacyPasswordPlaceholder() {
    return `legacy_${crypto.randomBytes(24).toString('hex')}`
  }

  async findClienteByUser(user, { autoCreate = false } = {}) {
    if (!user) return null

    let cliente = await Cliente.query().where('user_id', user.id).first()

    if (!cliente && user.email) {
      cliente = await Cliente.findBy('email', user.email)

      if (cliente && !cliente.user_id) {
        cliente.user_id = user.id
        await cliente.save()
      }
    }

    if (!cliente && autoCreate) {
      cliente = await Cliente.create({
        user_id: user.id,
        fullName: user.fullName,
        email: user.email,
        password: this.buildLegacyPasswordPlaceholder()
      })
    }

    return cliente
  }

  async findTecnicoByUser(user, { autoCreate = false } = {}) {
    if (!user) return null

    let tecnico = await Tecnico.query().where('user_id', user.id).first()

    if (!tecnico && user.email) {
      tecnico = await Tecnico.findBy('email', user.email)

      if (tecnico && !tecnico.user_id) {
        tecnico.user_id = user.id
        await tecnico.save()
      }
    }

    if (!tecnico && autoCreate) {
      tecnico = await Tecnico.create({
        user_id: user.id,
        fullName: user.fullName,
        email: user.email,
        disponibilidades: []
      })
    }

    return tecnico
  }
}

module.exports = new ProfileIdentityService()
