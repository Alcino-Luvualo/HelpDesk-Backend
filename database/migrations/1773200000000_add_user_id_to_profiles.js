'use strict'

const Schema = use('Schema')
const Database = use('Database')

class AddUserIdToProfilesSchema extends Schema {
  async _ensureColumn(tableName, columnName) {
    const columns = await Database.raw(`PRAGMA table_info(${tableName})`)
    const hasColumn = Array.isArray(columns) && columns.some((column) => column.name === columnName)

    if (!hasColumn) {
      await Database.raw(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} INTEGER`)
    }
  }

  async up () {
    await this._ensureColumn('clientes', 'user_id')
    await this._ensureColumn('tecnicos', 'user_id')

    await Database.raw('CREATE INDEX IF NOT EXISTS clientes_user_id_index ON clientes(user_id)')
    await Database.raw('CREATE INDEX IF NOT EXISTS tecnicos_user_id_index ON tecnicos(user_id)')

    const users = await Database.table('users').select('id', 'email')
    const usersByEmail = users.reduce((acc, user) => {
      if (user.email) {
        acc[user.email] = user.id
      }
      return acc
    }, {})

    const clientes = await Database.table('clientes').select('id', 'email', 'user_id')
    for (const cliente of clientes) {
      const userId = cliente.user_id || usersByEmail[cliente.email]
      if (userId) {
        await Database.table('clientes').where('id', cliente.id).update({ user_id: userId })
      }
    }

    const tecnicos = await Database.table('tecnicos').select('id', 'email', 'user_id')
    for (const tecnico of tecnicos) {
      const userId = tecnico.user_id || usersByEmail[tecnico.email]
      if (userId) {
        await Database.table('tecnicos').where('id', tecnico.id).update({ user_id: userId })
      }
    }
  }

  async down () {
    // SQLite legacy support: keep column on rollback to avoid table rebuild risks.
  }
}

module.exports = AddUserIdToProfilesSchema
