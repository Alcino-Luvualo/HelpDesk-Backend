'use strict'

const { deleteImageByUrl, uploadImage } = require('../../Services/CloudinaryService')

const Cliente = use('App/Models/Cliente')
const User = use('App/Models/User')
const Database = use('Database')
const profileIdentityService = use('App/Services/ProfileIdentityService')

class ClienteController {
  async _resolveClienteFromRequest({ auth, id }) {
    const user = await auth.getUser()

    if (user.role === 'cliente') {
      return profileIdentityService.findClienteByUser(user, { autoCreate: true })
    }

    return Cliente.find(id)
  }

  async index({ response }) {
    try {
      const clientes = await Cliente.all()
      return response.status(200).json(clientes)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao listar clientes',
        error: error.message
      })
    }
  }

  async show({ params, response }) {
    try {
      const cliente = await Cliente.find(params.id)

      if (!cliente) {
        return response.status(404).json({
          message: 'Cliente não encontrado'
        })
      }

      return response.status(200).json(cliente)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao buscar cliente',
        error: error.message
      })
    }
  }

  async create({ request, response }) {
    let trx
    try {
      const data = request.only(['fullName', 'email', 'password'])

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

      if (data.password.length < 6) {
        return response.status(400).json({
          message: 'A senha deve ter no mínimo 6 caracteres'
        })
      }

      const existingCliente = await Cliente.findBy('email', data.email)
      if (existingCliente) {
        return response.status(400).json({
          message: 'Já existe um cliente com este e-mail'
        })
      }

      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        return response.status(400).json({
          message: 'Já existe um usuário com este e-mail'
        })
      }

      trx = await Database.beginTransaction()
      const user = await User.create({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: 'cliente'
      }, trx)

      const cliente = await Cliente.create({
        user_id: user.id,
        fullName: data.fullName,
        email: data.email,
        password: profileIdentityService.buildLegacyPasswordPlaceholder()
      }, trx)

      await trx.commit()

      return response.status(201).json(cliente)
    } catch (error) {
      try {
        if (trx) await trx.rollback()
      } catch (e) {
        // ignore rollback error
      }
      return response.status(500).json({
        message: 'Erro ao criar cliente',
        error: error.message
      })
    }
  }

  async update({ params, request, response }) {
    try {
      const cliente = await Cliente.find(params.id)

      if (!cliente) {
        return response.status(404).json({
          message: 'Cliente não encontrado'
        })
      }

      const data = request.only(['fullName', 'email', 'password'])

      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.email)) {
          return response.status(400).json({
            message: 'Email inválido'
          })
        }
      }

      if (data.password && data.password.length < 6) {
        return response.status(400).json({
          message: 'A senha deve ter no mínimo 6 caracteres'
        })
      }

      const oldEmail = cliente.email

      cliente.merge({
        fullName: data.fullName,
        email: data.email
      })
      await cliente.save()

      // A senha autenticável fica somente em users
      if (data.email || data.fullName || data.password) {
        const user = cliente.user_id
          ? await User.find(cliente.user_id)
          : await User.findBy('email', oldEmail)
        if (user) {
          if (data.fullName) user.fullName = data.fullName
          if (data.email) user.email = data.email
          if (data.password) user.password = data.password
          await user.save()
        }
      }

      return response.status(200).json(cliente)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao atualizar cliente',
        error: error.message
      })
    }
  }

  async updateProfile({ params, request, response, auth }) {
    try {
      const user = await auth.getUser()
      const cliente = await this._resolveClienteFromRequest({ auth, id: params.id })

      if (!cliente) {
        return response.status(404).json({
          message: 'Cliente não encontrado'
        })
      }

      // Verificar se o cliente está atualizando seu próprio perfil
      const isOwnProfile = cliente.user_id ? cliente.user_id === user.id : user.email === cliente.email
      if (user.role === 'cliente' && !isOwnProfile) {
        return response.status(403).json({
          message: 'Você não tem permissão para atualizar este perfil'
        })
      }

      const data = request.only(['fullName', 'email'])

      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.email)) {
          return response.status(400).json({
            message: 'Email inválido'
          })
        }
      }

      const oldEmail = cliente.email

      cliente.merge(data)
      await cliente.save()

      // Atualizar também na tabela users
      const userRecord = cliente.user_id
        ? await User.find(cliente.user_id)
        : await User.findBy('email', oldEmail)
      if (userRecord) {
        if (data.fullName) userRecord.fullName = data.fullName
        if (data.email) userRecord.email = data.email
        await userRecord.save()
      }

      return response.status(200).json({
        message: 'Perfil atualizado com sucesso',
        cliente
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao atualizar perfil',
        error: error.message
      })
    }
  }

  async uploadFoto({ params, request, response, auth }) {
    try {
      const user = await auth.getUser()
      const cliente = await this._resolveClienteFromRequest({ auth, id: params.id })

      if (!cliente) {
        return response.status(404).json({
          message: 'Cliente não encontrado'
        })
      }

      // Verificar se o cliente está atualizando sua própria foto
      const isOwnProfile = cliente.user_id ? cliente.user_id === user.id : user.email === cliente.email
      if (user.role === 'cliente' && !isOwnProfile) {
        return response.status(403).json({
          message: 'Você não tem permissão para atualizar esta foto'
        })
      }

      const foto = request.file('foto', {
        types: ['image'],
        size: '2mb'
      })

      if (!foto) {
        return response.status(400).json({
          message: 'Nenhuma foto foi enviada'
        })
      }

      if (!foto.tmpPath) {
        return response.status(500).json({
          message: 'Erro ao fazer upload da foto',
          error: 'Arquivo temporário do upload não encontrado'
        })
      }

      if (cliente.fotoUrl) {
        await deleteImageByUrl(cliente.fotoUrl)
      }

      const uploadResult = await uploadImage(foto.tmpPath, 'clientes', cliente.id)

      cliente.fotoUrl = uploadResult.secure_url
      await cliente.save()

      return response.status(200).json({
        message: 'Foto atualizada com sucesso',
        fotoUrl: cliente.fotoUrl
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao fazer upload da foto',
        error: error.message
      })
    }
  }

  async removeFoto({ params, response, auth }) {
    try {
      const user = await auth.getUser()
      const cliente = await this._resolveClienteFromRequest({ auth, id: params.id })

      if (!cliente) {
        return response.status(404).json({
          message: 'Cliente não encontrado'
        })
      }

      // Verificar se o cliente está removendo sua própria foto
      const isOwnProfile = cliente.user_id ? cliente.user_id === user.id : user.email === cliente.email
      if (user.role === 'cliente' && !isOwnProfile) {
        return response.status(403).json({
          message: 'Você não tem permissão para remover esta foto'
        })
      }

      if (cliente.fotoUrl) {
        await deleteImageByUrl(cliente.fotoUrl)
      }

      cliente.fotoUrl = null
      await cliente.save()

      return response.status(200).json({
        message: 'Foto removida com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao remover foto',
        error: error.message
      })
    }
  }

  async destroy({ params, response }) {
    try {
      const cliente = await Cliente.find(params.id)

      if (!cliente) {
        return response.status(404).json({
          message: 'Cliente não encontrado'
        })
      }

      await cliente.delete()

      if (cliente.user_id) {
        const user = await User.find(cliente.user_id)
        if (user) {
          await user.delete()
        }
      } else {
        await User.query().where('email', cliente.email).delete()
      }

      return response.status(200).json({
        message: 'Cliente deletado com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao deletar cliente',
        error: error.message
      })
    }
  }
}


module.exports = ClienteController
