'use strict'

const User = use('App/Models/User')
const Cliente = use('App/Models/Cliente')
const Tecnico = use('App/Models/Tecnico')

class AuthController {
  async register({ request, response }) {
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

      const user = await User.create(data)

      if (data.role === 'cliente') {
        await Cliente.create({
          fullName: data.fullName,
          email: data.email,
          password: data.password
        })
      }

      if (data.role === 'tecnico') {
        await Tecnico.create({
          fullName: data.fullName,
          email: data.email,
          disponibilidades: []
        })
      }

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
        const cliente = await Cliente.findBy('email', user.email)
        if (cliente && cliente.fotoUrl) {
          fotoUrl = cliente.fotoUrl.startsWith('http')
            ? cliente.fotoUrl
            : `http://localhost:3333${cliente.fotoUrl}`
        }
      }

      // Se for técnico, buscar foto e disponibilidades da tabela tecnicos
      if (user.role === 'tecnico') {
        let tecnico = await Tecnico.findBy('email', user.email)
        if (!tecnico) {
          tecnico = await Tecnico.create({
            fullName: user.fullName,
            email: user.email,
            disponibilidades: []
          })
        }
        if (tecnico) {
          if (tecnico.fotoUrl) {
            fotoUrl = tecnico.fotoUrl.startsWith('http')
              ? tecnico.fotoUrl
              : `http://localhost:3333${tecnico.fotoUrl}`
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

      // Atualizar senha
      user.password = newPassword
      await user.save()

      // Se for cliente, atualizar também na tabela clientes
      if (user.role === 'cliente') {
        const cliente = await Cliente.findBy('email', user.email)
        if (cliente) {
          cliente.password = newPassword
          await cliente.save()
        }
      }

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
}

module.exports = AuthController
