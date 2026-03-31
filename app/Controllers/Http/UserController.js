'use strict'

const User = use('App/Models/User')

class UserController {
  async index({ response }) {
    try {
      const users = await User.query()
        .select('id', 'fullName', 'email', 'role', 'created_at', 'updated_at')
        .orderBy('id', 'asc')
        .fetch()

      return response.status(200).json(users)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao listar usuários',
        error: error.message
      })
    }
  }
}

module.exports = UserController
