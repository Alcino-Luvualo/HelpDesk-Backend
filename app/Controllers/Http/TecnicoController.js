'use strict'

const Tecnico = use('App/Models/Tecnico')

class TecnicoController {
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

  // Buscar um técnico específico
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
      const data = request.only(['fullName', 'email', 'disponibilidades'])
      const tecnico = await Tecnico.create(data)

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

      const data = request.only(['fullName', 'email', 'disponibilidades'])
      tecnico.merge(data)
      await tecnico.save()

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
}

module.exports = TecnicoController
