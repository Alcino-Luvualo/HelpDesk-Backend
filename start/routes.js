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
  Route.patch('/auth/password', 'AuthController.changePassword')
}).middleware(['auth:jwt'])

Route.group(() => {
  Route.patch('/users/:id/password', 'AuthController.adminChangeUserPassword')
}).middleware(['auth:jwt', 'role:admin'])

Route.group(() => {
  Route.patch('/clientes/:id', 'ClienteController.updateProfile')
  Route.patch('/clientes/:id/foto', 'ClienteController.uploadFoto')
  Route.delete('/clientes/:id/foto', 'ClienteController.removeFoto')
  Route.patch('/tecnicos/:id', 'TecnicoController.updateProfile')
  Route.patch('/tecnicos/:id/foto', 'TecnicoController.uploadFoto')
  Route.delete('/tecnicos/:id/foto', 'TecnicoController.removeFoto')
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
}).middleware(['auth:jwt', 'role:admin,cliente,tecnico'])

Route.group(() => {
  Route.post('/tecnicos', 'TecnicoController.create')
  Route.put('/tecnicos/:id', 'TecnicoController.update')
  Route.delete('/tecnicos/:id', 'TecnicoController.destroy')
}).middleware(['auth:jwt', 'role:admin'])

Route.group(() => {
  Route.get('/servicos', 'ServicoController.index')
  Route.get('/servicos/:id', 'ServicoController.show')
}).middleware(['auth:jwt', 'role:admin,tecnico,cliente'])

Route.group(() => {
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
  Route.post('/chamados/:id/adicionais', 'ChamadoController.adicionarServico')
  Route.delete('/chamados/:chamado_id/adicionais/:id', 'ChamadoController.removerServico')
}).middleware(['auth:jwt'])
