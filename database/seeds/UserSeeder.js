'use strict'

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const User = use('App/Models/User')

class UserSeeder {
  async run () {
    const adminExist = await User.findBy('email', 'admin@helpdesk.com')

    if (!adminExist) {
      await User.create({
        fullName: 'Admin',
        email: 'admin@helpdesk.com',
        password: 'admin123',
        role: 'admin'
      })
      console.log('Usuário admin criado com sucesso!')
      console.log('Email: admin@helpdesk.com')
      console.log('Senha: admin123')
    } else {
      console.log('Usuário admin já existe')
    }
  }
}

module.exports = UserSeeder
