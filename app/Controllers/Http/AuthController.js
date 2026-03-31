'use strict'

const User = use('App/Models/User')
const Cliente = use('App/Models/Cliente')
const Tecnico = use('App/Models/Tecnico')
const Database = use('Database')
const profileIdentityService = use('App/Services/ProfileIdentityService')

class AuthController {
  async _syncPasswordForUser(user, newPassword) {
    user.password = newPassword
    await user.save()
  }

  async register({ request, response }) {
    let trx
    try {
      const data = request.only(['fullName', 'email', 'password', 'role'])

      if (!data.fullName || !data.email || !data.password) {
        return response.status(400).json({
          message: 'Campos obrigatórios: fullName, email, password'
        })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return response.status(400).json({
          message: 'Email inválido'
        })
      }

      const rolesValidas = ['admin', 'tecnico', 'cliente']
      if (data.role && !rolesValidas.includes(data.role)) {
        return response.status(400).json({
          message: 'Role inválida. Use: admin, tecnico ou cliente'
        })
      }

      trx = await Database.beginTransaction()
      const user = await User.create(data, trx)

      if (data.role === 'cliente') {
        await Cliente.create({
          user_id: user.id,
          fullName: data.fullName,
          email: data.email,
          password: profileIdentityService.buildLegacyPasswordPlaceholder()
        }, trx)
      }

      if (data.role === 'tecnico') {
        await Tecnico.create({
          user_id: user.id,
          fullName: data.fullName,
          email: data.email,
          disponibilidades: []
        }, trx)
      }

      await trx.commit()

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
      try {
        if (trx) await trx.rollback()
      } catch (rollbackError) {
        // ignore rollback error
      }
      return response.status(400).json({
        message: 'Não foi possível registrar o usuário',
        error: error.message
      })
    }
  }

  async login({ request, auth, response }) {
    const { email, password } = request.only(['email', 'password'])

    if (!email || !password) {
      return response.status(400).json({
        message: 'Email e senha são obrigatórios'
      })
    }

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

      let fotoUrl = null
      let disponibilidades = undefined

      // Se for cliente, buscar foto da tabela clientes
      if (user.role === 'cliente') {
        const cliente = await profileIdentityService.findClienteByUser(user, { autoCreate: true })
        if (cliente && cliente.fotoUrl) {
          fotoUrl = cliente.fotoUrl
        }
      }

      // Se for técnico, buscar foto e disponibilidades da tabela tecnicos
      if (user.role === 'tecnico') {
        const tecnico = await profileIdentityService.findTecnicoByUser(user, { autoCreate: true })
        if (tecnico) {
          if (tecnico.fotoUrl) {
            fotoUrl = tecnico.fotoUrl
          }
          const disponibilidadesRaw = tecnico.disponibilidades
          if (Array.isArray(disponibilidadesRaw)) {
            disponibilidades = disponibilidadesRaw
          } else if (typeof disponibilidadesRaw === 'string') {
            try {
              const parsed = JSON.parse(disponibilidadesRaw)
              disponibilidades = Array.isArray(parsed) ? parsed : []
            } catch (e) {
              disponibilidades = []
            }
          } else {
            disponibilidades = []
          }
        }
      }

      return response.status(200).json({
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          fotoUrl: fotoUrl,
          disponibilidades
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

  async changePassword({ auth, request, response }) {
    try {
      const user = await auth.getUser()
      const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

      if (!currentPassword || !newPassword) {
        return response.status(400).json({
          message: 'Senha atual e nova senha são obrigatórias'
        })
      }

      if (newPassword.length < 6) {
        return response.status(400).json({
          message: 'A nova senha deve ter no mínimo 6 caracteres'
        })
      }

      // Verificar senha atual
      const Hash = use('Hash')
      const isSame = await Hash.verify(currentPassword, user.password)

      if (!isSame) {
        return response.status(401).json({
          message: 'Senha atual incorreta'
        })
      }

      await this._syncPasswordForUser(user, newPassword)

      return response.status(200).json({
        message: 'Senha alterada com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao alterar senha',
        error: error.message
      })
    }
  }

  async adminChangeUserPassword({ params, request, response }) {
    try {
      const user = await User.find(params.id)

      if (!user) {
        return response.status(404).json({
          message: 'Usuário não encontrado'
        })
      }

      const { newPassword } = request.only(['newPassword'])

      if (!newPassword) {
        return response.status(400).json({
          message: 'A nova senha é obrigatória'
        })
      }

      if (newPassword.length < 6) {
        return response.status(400).json({
          message: 'A nova senha deve ter no mínimo 6 caracteres'
        })
      }

      await this._syncPasswordForUser(user, newPassword)

      return response.status(200).json({
        message: 'Senha atualizada com sucesso pelo administrador'
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao atualizar senha do usuário',
        error: error.message
      })
    }
  }
}

module.exports = AuthController
