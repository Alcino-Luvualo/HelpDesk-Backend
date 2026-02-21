'use strict'

const Chamado = use('App/Models/Chamado')

class ChamadoController {
  async index({ response }) {
    try {
      const chamados = await Chamado.query()
        .with('servico')
        .with('cliente')
        .with('tecnico')
        .fetch()

      const chamadosFormatados = chamados.toJSON().map(chamado => {
        const valorServico = parseFloat(chamado.servico.valor_total) || 0
        const valorAdicional = parseFloat(chamado.valor_adicional) || 0
        const valorTotal = valorServico + valorAdicional

        return {
          id: chamado.id,
          atualizado_em: chamado.updated_at,
          servico_id: chamado.servico.id,
          servico_titulo: chamado.servico.titulos,
          valor_total: valorTotal.toFixed(2),
          cliente_nome: chamado.cliente.fullName,
          tecnico_nome: chamado.tecnico.fullName,
          status: chamado.status
        }
      })

      return response.status(200).json(chamadosFormatados)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao listar chamados',
        error: error.message
      })
    }
  }

  async show({ params, response }) {
    try {
      const chamado = await Chamado.query()
        .where('id', params.id)
        .with('servico')
        .with('cliente')
        .with('tecnico')
        .first()

      if (!chamado) {
        return response.status(404).json({
          message: 'Chamado não encontrado'
        })
      }

      const chamadoJSON = chamado.toJSON()
      const valorServico = parseFloat(chamadoJSON.servico.valor_total) || 0
      const valorAdicional = parseFloat(chamadoJSON.valor_adicional) || 0
      const valorTotal = valorServico + valorAdicional

      const detalhes = {
        id: chamadoJSON.id,
        descricao: chamadoJSON.descricao,
        categoria: chamadoJSON.servico.categoria,
        criado_em: chamadoJSON.created_at,
        atualizado_em: chamadoJSON.updated_at,
        status: chamadoJSON.status,
        tecnico_responsavel: chamadoJSON.tecnico.fullName,
        cliente_nome: chamadoJSON.cliente.fullName,
        servico: {
          titulo: chamadoJSON.servico.titulos,
          valor_base: parseFloat(chamadoJSON.servico.valor_total).toFixed(2)
        },
        valores_adicionais: {
          valor: parseFloat(chamadoJSON.valor_adicional).toFixed(2),
          descricao: chamadoJSON.descricao_adicional || 'Nenhum valor adicional'
        },
        valor_total: valorTotal.toFixed(2)
      }

      return response.status(200).json(detalhes)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao buscar chamado',
        error: error.message
      })
    }
  }

  async create({ request, response, auth }) {
    try {
      const clienteLogado = await auth.getUser()

      const data = request.only(['descricao', 'servico_id', 'tecnico_id'])

      const chamado = await Chamado.create({
        descricao: data.descricao,
        servico_id: data.servico_id,
        cliente_id: clienteLogado.id,
        tecnico_id: data.tecnico_id,
        valor_adicional: 0,
        status: 'Aberto'
      })

      return response.status(201).json(chamado)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao criar chamado',
        error: error.message
      })
    }
  }

  async update({ params, request, response }) {
    try {
      const chamado = await Chamado.find(params.id)

      if (!chamado) {
        return response.status(404).json({
          message: 'Chamado não encontrado'
        })
      }

      const data = request.only([
        'descricao',
        'servico_id',
        'tecnico_id',
        'valor_adicional',
        'descricao_adicional',
        'status'
      ])

      chamado.merge(data)
      await chamado.save()

      return response.status(200).json(chamado)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao atualizar chamado',
        error: error.message
      })
    }
  }

  async destroy({ params, response }) {
    try {
      const chamado = await Chamado.find(params.id)

      if (!chamado) {
        return response.status(404).json({
          message: 'Chamado não encontrado'
        })
      }

      if (chamado.status !== 'Encerrado') {
        return response.status(400).json({
          message: 'Apenas chamados encerrados podem ser deletados'
        })
      }

      await chamado.delete()

      return response.status(200).json({
        message: 'Chamado deletado com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao deletar chamado',
        error: error.message
      })
    }
  }
}

module.exports = ChamadoController
