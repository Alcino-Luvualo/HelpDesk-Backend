'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.on('/').render('welcome')

Route.post('/register', 'AuthController.register')
Route.post('/login', 'AuthController.login')

Route.group(() => {
  Route.get('/me', 'AuthController.me')
  Route.post('/logout', 'AuthController.logout')
}).middleware(['auth:jwt'])

Route.group(() => {
  Route.get('/clientes', 'ClienteController.index')
  Route.get('/clientes/:id', 'ClienteController.show')
  Route.post('/clientes', 'ClienteController.create')
  Route.put('/clientes/:id', 'ClienteController.update')
  Route.delete('/clientes/:id', 'ClienteController.destroy')
}).middleware(['auth:jwt', 'role:admin,tecnico'])

Route.group(() => {
  Route.get('/tecnicos', 'TecnicoController.index')
  Route.get('/tecnicos/:id', 'TecnicoController.show')
  Route.post('/tecnicos', 'TecnicoController.create')
  Route.put('/tecnicos/:id', 'TecnicoController.update')
  Route.delete('/tecnicos/:id', 'TecnicoController.destroy')
}).middleware(['auth:jwt', 'role:admin'])

Route.group(() => {
  Route.get('/servicos', 'ServicoController.index')
  Route.get('/servicos/:id', 'ServicoController.show')
  Route.post('/servicos', 'ServicoController.create')
  Route.put('/servicos/:id', 'ServicoController.update')
  Route.delete('/servicos/:id', 'ServicoController.destroy')
}).middleware(['auth:jwt', 'role:admin,tecnico'])

Route.group(() => {
  Route.get('/chamados', 'ChamadoController.index')
  Route.get('/chamados/:id', 'ChamadoController.show')
  Route.post('/chamados', 'ChamadoController.create')
  Route.put('/chamados/:id', 'ChamadoController.update')
  Route.delete('/chamados/:id', 'ChamadoController.destroy')
}).middleware(['auth:jwt'])
