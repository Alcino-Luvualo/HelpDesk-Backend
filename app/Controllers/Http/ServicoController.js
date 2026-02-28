'use strict'

const Servico = use('App/Models/Servico')

class ServicoController {
  async index({ response }) {
    try {
      const servicos = await Servico.all()
      return response.status(200).json(servicos)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao listar serviços',
        error: error.message
      })
    }
  }

  async show({ params, response }) {
    try {
      const servico = await Servico.find(params.id)

      if (!servico) {
        return response.status(404).json({
          message: 'Serviço não encontrado'
        })
      }

      return response.status(200).json(servico)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao buscar serviço',
        error: error.message
      })
    }
  }

  async create({ request, response }) {
    try {
      const data = request.only(['titulos', 'valor_total', 'estado'])

      if (!data.titulos || data.valor_total === undefined) {
        return response.status(400).json({
          message: 'Campos obrigatórios: titulos, valor_total'
        })
      }

      if (isNaN(data.valor_total) || parseFloat(data.valor_total) < 0) {
        return response.status(400).json({
          message: 'Valor total deve ser um número positivo'
        })
      }

      const servico = await Servico.create(data)

      return response.status(201).json(servico)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao criar serviço',
        error: error.message
      })
    }
  }

  async update({ params, request, response }) {
    try {
      const servico = await Servico.find(params.id)

      if (!servico) {
        return response.status(404).json({
          message: 'Serviço não encontrado'
        })
      }

      const data = request.only(['titulos', 'valor_total', 'estado'])

      if (data.valor_total !== undefined) {
        if (isNaN(data.valor_total) || parseFloat(data.valor_total) < 0) {
          return response.status(400).json({
            message: 'Valor total deve ser um número positivo'
          })
        }
      }

      servico.merge(data)
      await servico.save()

      return response.status(200).json(servico)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao atualizar serviço',
        error: error.message
      })
    }
  }

  async destroy({ params, response }) {
    try {
      const servico = await Servico.find(params.id)

      if (!servico) {
        return response.status(404).json({
          message: 'Serviço não encontrado'
        })
      }

      await servico.delete()

      return response.status(200).json({
        message: 'Serviço deletado com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao deletar serviço',
        error: error.message
      })
    }
  }
}

module.exports = ServicoController
