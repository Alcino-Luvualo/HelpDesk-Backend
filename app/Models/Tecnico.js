'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Tecnico extends Model {
  /**
   * Diz ao AdonisJS para serializar/desserializar este campo como JSON
   * automaticamente ao ler e salvar no banco
   */
  static get casts() {
    return {
      disponibilidades: 'json'
    }
  }

  /**
   * Getter: ao LER do banco, garantir que sempre retorna array
   * Chamado automaticamente quando o campo é acessado
   */
  getDisponibilidades(value) {
    // Se não tem valor, retorna array vazio
    if (!value) return []

    // Se já é array, retorna direto
    if (Array.isArray(value)) return value

    // Se é string, tenta fazer parse
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      // Se falhar o parse, retorna array vazio
      return []
    }
  }

  /**
   * Setter: ao SALVAR no banco, sempre serializar como string JSON
   * Chamado automaticamente quando o campo é atribuído
   */
  setDisponibilidades(value) {
    // Se não tem valor, salva array vazio como JSON
    if (!value) return JSON.stringify([])

    // Se já é string, verifica se é JSON válido
    if (typeof value === 'string') {
      try {
        JSON.parse(value)
        return value // já é string JSON válida
      } catch (e) {
        return JSON.stringify([])
      }
    }

    // Se é array, converte para string JSON
    if (Array.isArray(value)) {
      return JSON.stringify(value)
    }

    // Qualquer outro tipo, salva array vazio
    return JSON.stringify([])
  }

  /**
   * Relacionamento: um técnico tem muitos chamados
   */
  chamados() {
    return this.hasMany('App/Models/Chamado')
  }

  getFotoUrl (fotoUrl) {
    if (!fotoUrl) return null
    return fotoUrl.startsWith('http') ? fotoUrl : `http://localhost:3333${fotoUrl}`
  }
}

module.exports = Tecnico
