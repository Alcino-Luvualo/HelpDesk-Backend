'use strict'

const Cliente = use('App/Models/Cliente')

class ClienteController {
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
    try {
      const data = request.only(['fullName', 'email', 'password'])
      const cliente = await Cliente.create(data)

      return response.status(201).json(cliente)
    } catch (error) {
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
      cliente.merge(data)
      await cliente.save()

      return response.status(200).json(cliente)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao atualizar cliente',
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
