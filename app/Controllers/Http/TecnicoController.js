'use strict'

const { deleteImageByUrl, uploadImage } = require('../../Services/CloudinaryService')

const Tecnico = use('App/Models/Tecnico')
const User = use('App/Models/User')

class TecnicoController {
  async _resolveTecnicoFromRequest({ auth, id }) {
    const user = await auth.getUser()

    if (user.role === 'tecnico') {
      let tecnico = await Tecnico.findBy('email', user.email)
      if (!tecnico) {
        tecnico = await Tecnico.create({
          fullName: user.fullName,
          email: user.email,
          disponibilidades: []
        })
      }
      return tecnico
    }

    return Tecnico.find(id)
  }

  async index({ response }) {
    try {
      const tecnicos = await Tecnico.all()
      return response.status(200).json(tecnicos)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao listar técnicos',
        error: error.message
      })
    }
  }

  async show({ params, response }) {
    try {
      const tecnico = await Tecnico.find(params.id)

      if (!tecnico) {
        return response.status(404).json({
          message: 'Técnico não encontrado'
        })
      }

      return response.status(200).json(tecnico)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao buscar técnico',
        error: error.message
      })
    }
  }

  async create({ request, response }) {
    try {
      const data = request.only(['fullName', 'email', 'disponibilidades', 'password'])

      if (!data.fullName || !data.email) {
        return response.status(400).json({
          message: 'Campos obrigatórios: fullName, email'
        })
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        return response.status(400).json({
          message: 'Email inválido'
        })
      }

      const password = data.password && String(data.password).trim()
      if (!password || password.length < 6) {
        return response.status(400).json({
          message: 'Senha obrigatória com mínimo de 6 caracteres'
        })
      }

      if (data.disponibilidades && !Array.isArray(data.disponibilidades)) {
        return response.status(400).json({
          message: 'Disponibilidades deve ser um array'
        })
      }

      const existingUser = await User.findBy('email', data.email)
      if (existingUser) {
        return response.status(400).json({
          message: 'Já existe um usuário com este e-mail'
        })
      }

      const tecnico = await Tecnico.create({
        fullName: data.fullName,
        email: data.email,
        disponibilidades: data.disponibilidades || []
      })

      await User.create({
        fullName: data.fullName,
        email: data.email,
        password,
        role: 'tecnico'
      })

      return response.status(201).json(tecnico)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao criar técnico',
        error: error.message
      })
    }
  }

  async update({ params, request, response }) {
    try {
      const tecnico = await Tecnico.find(params.id)

      if (!tecnico) {
        return response.status(404).json({
          message: 'Técnico não encontrado'
        })
      }

      const data = request.only(['fullName', 'email', 'disponibilidades', 'password'])
      const oldEmail = tecnico.email

      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.email)) {
          return response.status(400).json({
            message: 'Email inválido'
          })
        }
      }

      if (data.disponibilidades && !Array.isArray(data.disponibilidades)) {
        return response.status(400).json({
          message: 'Disponibilidades deve ser um array'
        })
      }

      if (data.password && data.password.length < 6) {
        return response.status(400).json({
          message: 'A senha deve ter no mínimo 6 caracteres'
        })
      }

      // Atribuição direta em vez de merge para acionar os setters
      // Isso garante que setDisponibilidades() seja chamado corretamente
      if (data.fullName !== undefined) {
        tecnico.fullName = data.fullName
      }
      if (data.email !== undefined) {
        tecnico.email = data.email
      }
      if (data.disponibilidades !== undefined) {
        tecnico.disponibilidades = data.disponibilidades // aciona setDisponibilidades()
      }

      await tecnico.save()

      if (data.email || data.fullName || data.password) {
        const user = await User.findBy('email', oldEmail)
        if (user) {
          if (data.fullName) user.fullName = data.fullName
          if (data.email) user.email = data.email
          if (data.password) user.password = data.password
          await user.save()
        }
      }

      return response.status(200).json(tecnico)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao atualizar técnico',
        error: error.message
      })
    }
  }

  async destroy({ params, response }) {
    try {
      const tecnico = await Tecnico.find(params.id)

      if (!tecnico) {
        return response.status(404).json({
          message: 'Técnico não encontrado'
        })
      }

      await tecnico.delete()
      await User.query().where('email', tecnico.email).delete()

      return response.status(200).json({
        message: 'Técnico deletado com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao deletar técnico',
        error: error.message
      })
    }
  }

  async updateProfile({ params, request, response, auth }) {
    try {
      const user = await auth.getUser()
      const tecnico = await this._resolveTecnicoFromRequest({ auth, id: params.id })

      if (!tecnico) {
        return response.status(404).json({
          message: 'Técnico não encontrado'
        })
      }

      if (user.role === 'tecnico' && user.email !== tecnico.email) {
        return response.status(403).json({
          message: 'Você não tem permissão para atualizar este perfil'
        })
      }

      const data = request.only(['fullName', 'email'])
      const oldEmail = tecnico.email

      if (data.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(data.email)) {
          return response.status(400).json({
            message: 'Email inválido'
          })
        }
      }

      tecnico.merge(data)
      await tecnico.save()

      const userRecord = await User.findBy('email', oldEmail)
      if (userRecord) {
        if (data.fullName) userRecord.fullName = data.fullName
        if (data.email) userRecord.email = data.email
        await userRecord.save()
      }

      return response.status(200).json({
        message: 'Perfil atualizado com sucesso',
        tecnico
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
      const tecnico = await this._resolveTecnicoFromRequest({ auth, id: params.id })

      if (!tecnico) {
        return response.status(404).json({
          message: 'Técnico não encontrado'
        })
      }

      if (user.role === 'tecnico' && user.email !== tecnico.email) {
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

      if (tecnico.fotoUrl) {
        await deleteImageByUrl(tecnico.fotoUrl)
      }

      const uploadResult = await uploadImage(foto.tmpPath, 'tecnicos', tecnico.id)

      tecnico.fotoUrl = uploadResult.secure_url
      await tecnico.save()

      return response.status(200).json({
        message: 'Foto atualizada com sucesso',
        fotoUrl: tecnico.fotoUrl
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
      const tecnico = await this._resolveTecnicoFromRequest({ auth, id: params.id })

      if (!tecnico) {
        return response.status(404).json({
          message: 'Técnico não encontrado'
        })
      }

      if (user.role === 'tecnico' && user.email !== tecnico.email) {
        return response.status(403).json({
          message: 'Você não tem permissão para remover esta foto'
        })
      }

      if (tecnico.fotoUrl) {
        await deleteImageByUrl(tecnico.fotoUrl)
      }

      tecnico.fotoUrl = null
      await tecnico.save()

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
}

module.exports = TecnicoController
