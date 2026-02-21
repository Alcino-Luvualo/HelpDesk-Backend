'use strict'

class CheckRole {
  async handle({ auth, response }, next, roles) {
    try {
      const user = await auth.getUser()

      // Converte roles para array se for string
      const allowedRoles = Array.isArray(roles) ? roles : [roles]

      // Verifica se o usuário tem uma das roles permitidas
      if (!allowedRoles.includes(user.role)) {
        return response.status(403).json({
          message: 'Acesso negado. Você não tem permissão para acessar este recurso.'
        })
      }

      await next()
    } catch (error) {
      return response.status(401).json({
        message: 'Não autenticado'
      })
    }
  }
}

module.exports = CheckRole
