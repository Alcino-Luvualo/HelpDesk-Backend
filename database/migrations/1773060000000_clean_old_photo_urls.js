'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CleanOldPhotoUrlsSchema extends Schema {
  up () {
    this.raw(`
      UPDATE clientes 
      SET "fotoUrl" = NULL 
      WHERE "fotoUrl" LIKE '/uploads/%';
      
      UPDATE tecnicos 
      SET "fotoUrl" = NULL 
      WHERE "fotoUrl" LIKE '/uploads/%';
    `)
  }

  down () {
    // Não há como reverter, mas não é necessário
  }
}

module.exports = CleanOldPhotoUrlsSchema
