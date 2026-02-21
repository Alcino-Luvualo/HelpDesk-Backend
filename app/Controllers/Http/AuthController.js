'use strict'

const User = use('App/Models/User')

class AuthController {
  async register({ request, response }) {
    try {
      const data = request.only(['fullName', 'email', 'password', 'role'])

      // Validação básica de role
      const rolesValidas = ['admin', 'tecnico', 'cliente']
      if (data.role && !rolesValidas.includes(data.role)) {
        return response.status(400).json({
          message: 'Role inválida. Use: admin, tecnico ou cliente'
        })
      }

      const user = await User.create(data)

      return response.status(201).json({
        message: 'Usuário registrado com sucesso',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      })
    } catch (error) {
      return response.status(400).json({
        message: 'Não foi possível registrar o usuário',
        error: error.message
      })
    }
  }

  async login({ request, auth, response }) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const token = await auth.attempt(email, password)
      const user = await User.findBy('email', email)

      return response.status(200).json({
        message: 'Login realizado com sucesso',
        token: token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      })
    } catch (error) {
      return response.status(401).json({
        message: 'Credenciais inválidas'
      })
    }
  }

  async me({ auth, response }) {
    try {
      const user = await auth.getUser()
      return response.status(200).json({
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      })
    } catch (error) {
      return response.status(401).json({
        message: 'Não autenticado'
      })
    }
  }

  async logout({ auth, response }) {
    try {
      await auth.logout()
      return response.status(200).json({
        message: 'Logout realizado com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao fazer logout'
      })
    }
  }
}

module.exports = AuthController
