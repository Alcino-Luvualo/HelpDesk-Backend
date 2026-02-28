'use strict'

class CheckRole {
  async handle({ auth, response }, next, roles) {
    try {
      const user = await auth.getUser()

      let allowedRoles = Array.isArray(roles) ? roles : [roles]

      if (typeof allowedRoles[0] === 'string' && allowedRoles[0].includes(',')) {
        allowedRoles = allowedRoles[0].split(',').map(role => role.trim())
      }

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
