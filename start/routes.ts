/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(async () => {
  Route.post('/login', 'AuthController.login')
  Route.post('/register', 'AuthController.register')
}).prefix('/auth')

Route.group(async () => {
  Route.post('/logout', 'AuthController.logout')

  Route.group(async () => {
    Route.resource('/users', 'UsersController').apiOnly().as('admin.users')
  }).prefix('/admin').namespace('App/Controllers/Http/Admin')
  
  Route.group(async () => {
    // Route.get('/profile', 'UserController.profile')
    // Route.put('/profile', 'UserController.updateProfile')
    // Route.put('/password', 'UserController.updatePassword')
    Route.get('/devices', 'DeviceController.index')
    Route.post('/devices', 'DeviceController.store')
    Route.put('/devices/:id', 'DeviceController.update').as('user.devices.update')
    Route.delete('/devices/:id', 'DeviceController.destroy').as('user.devices.destroy')
    Route.post('/devices/:id/grant', 'DeviceController.grant').as('user.devices.grant')
    Route.post('/devices/:id/revoke', 'DeviceController.revoke').as('user.devices.revoke')
  }).prefix('/user').namespace('App/Controllers/Http/User')
}).middleware('auth:api')