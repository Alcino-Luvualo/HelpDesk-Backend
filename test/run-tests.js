'use strict'

const path = require('path')
const assert = require('assert')
const { Ignitor } = require('@adonisjs/ignitor')

function makeResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = typeof payload.toJSON === 'function' ? payload.toJSON() : payload
      return this.body
    }
  }
}

async function bootApp() {
  const appRoot = path.join(__dirname, '..')
  const ignitor = new Ignitor(require('@adonisjs/fold'))
  ignitor.appRoot(appRoot)
  await ignitor.fire()
}

async function clearDatabase(Database) {
  await Database.table('tokens').delete()
  await Database.table('adicionais').delete()
  await Database.table('chamados').delete()
  await Database.table('clientes').delete()
  await Database.table('tecnicos').delete()
  await Database.table('servicos').delete()
  await Database.table('users').delete()
}

async function run() {
  await bootApp()

  const Database = use('Database')
  const Hash = use('Hash')
  const User = use('App/Models/User')
  const Cliente = use('App/Models/Cliente')
  const AuthController = use('App/Controllers/Http/AuthController')
  const UserController = use('App/Controllers/Http/UserController')
  const profileIdentityService = use('App/Services/ProfileIdentityService')

  const tests = []

  tests.push(async () => {
    await clearDatabase(Database)

    const user = await User.create({
      fullName: 'Cliente Teste',
      email: 'cliente.teste@example.com',
      password: '123456',
      role: 'cliente'
    })

    const cliente = await Cliente.create({
      user_id: user.id,
      fullName: user.fullName,
      email: user.email,
      password: profileIdentityService.buildLegacyPasswordPlaceholder()
    })

    const previousLegacyPassword = cliente.password
    const controller = new AuthController()
    const response = makeResponse()

    await controller.adminChangeUserPassword({
      params: { id: user.id },
      request: {
        only() {
          return { newPassword: '654321' }
        }
      },
      response
    })

    await user.reload()
    await cliente.reload()

    assert.equal(response.statusCode, 200)
    assert.equal(await Hash.verify('654321', user.password), true)
    assert.equal(cliente.password, previousLegacyPassword)
  })

  tests.push(async () => {
    await clearDatabase(Database)

    const controller = new AuthController()
    const response = makeResponse()

    await controller.register({
      request: {
        only() {
          return {
            fullName: 'Tecnico Teste',
            email: 'tecnico.teste@example.com',
            password: '123456',
            role: 'tecnico'
          }
        }
      },
      response
    })

    const user = await User.findBy('email', 'tecnico.teste@example.com')
    const tecnico = await profileIdentityService.findTecnicoByUser(user)

    assert.equal(response.statusCode, 201)
    assert.ok(user)
    assert.ok(tecnico)
    assert.equal(tecnico.user_id, user.id)
  })

  tests.push(async () => {
    await clearDatabase(Database)

    await User.create({
      fullName: 'Admin Teste',
      email: 'admin.teste@example.com',
      password: '123456',
      role: 'admin'
    })

    await User.create({
      fullName: 'Cliente Teste',
      email: 'cliente.lista@example.com',
      password: '123456',
      role: 'cliente'
    })

    const controller = new UserController()
    const response = makeResponse()

    await controller.index({ response })

    assert.equal(response.statusCode, 200)
    assert.equal(Array.isArray(response.body), true)
    assert.equal(response.body.length, 2)
    assert.equal(Object.prototype.hasOwnProperty.call(response.body[0], 'password'), false)
  })

  let failed = false

  for (let index = 0; index < tests.length; index++) {
    const test = tests[index]
    const label = `test ${index + 1}`

    try {
      await test()
      console.log(`PASS ${label}`)
    } catch (error) {
      failed = true
      console.error(`FAIL ${label}`)
      console.error(error)
    }
  }

  await clearDatabase(Database)
  await Database.close()

  if (failed) {
    process.exit(1)
  }
}

run().catch(async (error) => {
  console.error(error)
  try {
    const Database = use('Database')
    await Database.close()
  } catch (closeError) {
    // ignore close error
  }
  process.exit(1)
})
