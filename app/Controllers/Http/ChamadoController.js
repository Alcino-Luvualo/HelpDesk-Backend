'use strict'

const Chamado = use('App/Models/Chamado')
const Cliente = use('App/Models/Cliente')
const Tecnico = use('App/Models/Tecnico')
const Adicional = use('App/Models/Adicional')
const crypto = require('crypto')

class ChamadoController {
  async _getClienteIdByUser({ auth }) {
    const user = await auth.getUser()
    if (user.role !== 'cliente') return null
    const cliente = await Cliente.findBy('email', user.email)
    return cliente ? cliente.id : null
  }

  async _getTecnicoIdByUser({ auth }) {
    const user = await auth.getUser()
    if (user.role !== 'tecnico') return null
    const tecnico = await Tecnico.findBy('email', user.email)
    return tecnico ? tecnico.id : null
  }

  async index({ response, auth }) {
    try {
      let query = Chamado.query()
        .with('servico')
        .with('cliente')
        .with('tecnico')

      const clienteId = await this._getClienteIdByUser({ auth })
      if (clienteId !== null) {
        query = query.where('cliente_id', clienteId)
      }
      const tecnicoId = await this._getTecnicoIdByUser({ auth })
      if (tecnicoId !== null) {
        query = query.where('tecnico_id', tecnicoId)
      }

      const chamados = await query.fetch()

      const chamadosFormatados = chamados.toJSON().map(chamado => {
        const valorServico = parseFloat(chamado.servico?.valor_total || 0)
        const valorAdicional = parseFloat(chamado.valor_adicional || 0)
        const valorTotal = valorServico + valorAdicional

        return {
          id: chamado.id,
          titulo: chamado.titulo || '',
          descricao: chamado.descricao || '',
          criado_em: chamado.created_at,
          atualizado_em: chamado.updated_at,
          servico_id: chamado.servico?.id,
          servico_titulo: chamado.servico?.titulos || '',
          valor_total: valorTotal.toFixed(2),
          cliente_nome: chamado.cliente?.fullName || '',
          cliente_foto_url: chamado.cliente?.fotoUrl || null,
          tecnico_nome: chamado.tecnico?.fullName || '',
          tecnico_foto_url: chamado.tecnico?.fotoUrl || null,
          status: chamado.status
        }
      })

      return response.status(200).json(chamadosFormatados)
    } catch (error) {
      console.error('Erro ao listar chamados:', error.message)
      return response.status(500).json({
        message: 'Erro ao listar chamados',
        error: error.message
      })
    }
  }

  async show({ params, response, auth }) {
    try {
      const chamado = await Chamado.query()
        .where('id', params.id)
        .with('servico')
        .with('cliente')
        .with('tecnico')
        .with('adicionais')
        .first()

      if (!chamado) {
        return response.status(404).json({
          message: 'Chamado não encontrado'
        })
      }

      const clienteId = await this._getClienteIdByUser({ auth })
      if (clienteId !== null && chamado.cliente_id !== clienteId) {
        return response.status(403).json({
          message: 'Acesso negado a este chamado'
        })
      }
      const tecnicoId = await this._getTecnicoIdByUser({ auth })
      if (tecnicoId !== null && chamado.tecnico_id !== tecnicoId) {
        return response.status(403).json({
          message: 'Acesso negado a este chamado'
        })
      }

      const chamadoJSON = chamado.toJSON()
      const valorServico = parseFloat(chamadoJSON.servico?.valor_total || 0)

      const adicionaisRelacao = Array.isArray(chamadoJSON.adicionais)
        ? chamadoJSON.adicionais.map(a => ({
          id: a.id,
          descricao: a.descricao,
          valor: parseFloat(a.valor).toFixed(2)
        }))
        : []

      // Fallback para dados antigos sem tabela de adicionais
      const adicionaisFallback = []
      if (adicionaisRelacao.length === 0) {
        const valorAdicionalAntigo = parseFloat(chamadoJSON.valor_adicional || 0)
        if (valorAdicionalAntigo > 0) {
          adicionaisFallback.push({
            id: 1,
            descricao: chamadoJSON.descricao_adicional || 'Valor adicional',
            valor: valorAdicionalAntigo.toFixed(2)
          })
        }
      }

      const adicionais = adicionaisRelacao.length > 0
        ? adicionaisRelacao
        : adicionaisFallback

      const valorAdicional = adicionais.reduce((soma, a) => soma + parseFloat(a.valor || 0), 0)
      const valorTotal = valorServico + valorAdicional

      const detalhes = {
        id: chamadoJSON.id,
        titulo: chamadoJSON.titulo || 'Sem título',
        descricao: chamadoJSON.descricao,
        categoria: chamadoJSON.servico?.titulos || '',
        servico_titulo: chamadoJSON.servico?.titulos || '',
        criado_em: chamadoJSON.created_at,
        atualizado_em: chamadoJSON.updated_at,
        status: chamadoJSON.status,
        tecnico_nome: chamadoJSON.tecnico?.fullName || '',
        tecnico_foto_url: chamadoJSON.tecnico?.fotoUrl || null,
        tecnico_email: chamadoJSON.tecnico?.email || '',
        cliente_nome: chamadoJSON.cliente?.fullName || '',
        cliente_foto_url: chamadoJSON.cliente?.fotoUrl || null,
        preco_base: parseFloat(chamadoJSON.servico?.valor_total || 0).toFixed(2),
        adicionais: adicionais,
        valor_total: valorTotal.toFixed(2)
      }

      return response.status(200).json(detalhes)
    } catch (error) {
      console.error('Erro ao buscar chamado:', error.message)
      return response.status(500).json({
        message: 'Erro ao buscar chamado',
        error: error.message
      })
    }
  }

  async create({ request, response, auth }) {
    try {
      const user = await auth.getUser()
      const data = request.only(['titulo', 'descricao', 'servico_id', 'tecnico_id', 'cliente_id'])

      let clienteId
      if (user.role === 'cliente') {
        let cliente = await Cliente.findBy('email', user.email)

        /* Se o cliente não existe, cria automaticamente
        if (!cliente) {
          cliente = await Cliente.create({
            fullName: user.fullName,
            email: user.email,
            password: 'temp_password_' + Date.now() // Senha temporária
          })
        }*/

        if (!cliente) {
          const tempPassword = crypto.randomBytes(16).toString('hex')
          cliente = await Cliente.create({
            fullName: user.fullName,
            email: user.email,
            password: tempPassword
          })
        }

        clienteId = cliente.id
      } else {
        if (!data.cliente_id) {
          return response.status(400).json({
            message: 'Campos obrigatórios: titulo, descricao, servico_id, tecnico_id, cliente_id'
          })
        }
        clienteId = data.cliente_id
      }

      const titulo = data.titulo
      const descricao = data.descricao
      const servico_id = data.servico_id
      const tecnico_id = data.tecnico_id

      if (!titulo || !descricao || !servico_id || !tecnico_id) {
        return response.status(400).json({
          message: 'Campos obrigatórios: titulo, descricao, servico_id, tecnico_id'
        })
      }

      if (isNaN(servico_id) || isNaN(tecnico_id)) {
        return response.status(400).json({
          message: 'servico_id e tecnico_id devem ser números válidos'
        })
      }

      const chamado = await Chamado.create({
        titulo,
        descricao,
        servico_id,
        cliente_id: clienteId,
        tecnico_id,
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

  async update({ params, request, response, auth }) {
    try {
      const chamado = await Chamado.find(params.id)

      if (!chamado) {
        return response.status(404).json({
          message: 'Chamado não encontrado'
        })
      }

      const clienteId = await this._getClienteIdByUser({ auth })
      if (clienteId !== null && chamado.cliente_id !== clienteId) {
        return response.status(403).json({
          message: 'Acesso negado a este chamado'
        })
      }
      const tecnicoId = await this._getTecnicoIdByUser({ auth })
      if (tecnicoId !== null && chamado.tecnico_id !== tecnicoId) {
        return response.status(403).json({
          message: 'Acesso negado a este chamado'
        })
      }
      const user = await auth.getUser()
      if (user.role === 'cliente') {
        return response.status(403).json({
          message: 'Cliente não pode editar chamados. Apenas visualização.'
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

      if (data.status) {
        const statusValidos = ['Aberto', 'Em atendimento', 'Encerrado']
        if (!statusValidos.includes(data.status)) {
          return response.status(400).json({
            message: 'Status inválido. Use: Aberto, Em atendimento ou Encerrado'
          })
        }
      }

      if (data.valor_adicional !== undefined) {
        if (isNaN(data.valor_adicional) || parseFloat(data.valor_adicional) < 0) {
          return response.status(400).json({
            message: 'Valor adicional deve ser um número positivo'
          })
        }
      }

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

  async destroy({ params, response, auth }) {
    try {
      const chamado = await Chamado.find(params.id)

      if (!chamado) {
        return response.status(404).json({
          message: 'Chamado não encontrado'
        })
      }

      const clienteId = await this._getClienteIdByUser({ auth })
      if (clienteId !== null) {
        return response.status(403).json({
          message: 'Cliente não pode excluir chamados'
        })
      }
      const tecnicoId = await this._getTecnicoIdByUser({ auth })
      if (tecnicoId !== null && chamado.tecnico_id !== tecnicoId) {
        return response.status(403).json({
          message: 'Acesso negado a este chamado'
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

  async adicionarServico({ params, request, response, auth }) {
    try {
      const chamado = await Chamado.find(params.id)

      if (!chamado) {
        return response.status(404).json({
          message: 'Chamado não encontrado'
        })
      }

      const tecnicoId = await this._getTecnicoIdByUser({ auth })
      if (tecnicoId !== null && chamado.tecnico_id !== tecnicoId) {
        return response.status(403).json({
          message: 'Acesso negado a este chamado'
        })
      }

      const { descricao, valor } = request.only(['descricao', 'valor'])

      if (!descricao || !valor) {
        return response.status(400).json({
          message: 'Campos obrigatórios: descricao, valor'
        })
      }

      if (isNaN(valor) || parseFloat(valor) <= 0) {
        return response.status(400).json({
          message: 'Valor deve ser um número positivo'
        })
      }

      const adicional = await Adicional.create({
        chamado_id: chamado.id,
        descricao,
        valor: parseFloat(valor)
      })

      const soma = await Adicional.query()
        .where('chamado_id', chamado.id)
        .sum('valor as total')

      const novoValor = soma && soma[0] && soma[0].total ? parseFloat(soma[0].total) : 0
      chamado.valor_adicional = novoValor
      chamado.descricao_adicional = descricao
      await chamado.save()

      return response.status(201).json(adicional)
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao adicionar serviço',
        error: error.message
      })
    }
  }

  async removerServico({ params, response, auth }) {
    try {
      const chamado = await Chamado.find(params.chamado_id)

      if (!chamado) {
        return response.status(404).json({
          message: 'Chamado não encontrado'
        })
      }

      const tecnicoId = await this._getTecnicoIdByUser({ auth })
      if (tecnicoId !== null && chamado.tecnico_id !== tecnicoId) {
        return response.status(403).json({
          message: 'Acesso negado a este chamado'
        })
      }

      const adicional = await Adicional.query()
        .where('id', params.id)
        .where('chamado_id', chamado.id)
        .first()

      if (!adicional) {
        return response.status(404).json({
          message: 'Serviço adicional não encontrado'
        })
      }

      await adicional.delete()

      const soma = await Adicional.query()
        .where('chamado_id', chamado.id)
        .sum('valor as total')

      const novoValor = soma && soma[0] && soma[0].total ? parseFloat(soma[0].total) : 0
      chamado.valor_adicional = novoValor
      if (novoValor === 0) {
        chamado.descricao_adicional = null
      }
      await chamado.save()

      return response.status(200).json({
        message: 'Serviço adicional removido com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao remover serviço',
        error: error.message
      })
    }
  }
}

module.exports = ChamadoController
