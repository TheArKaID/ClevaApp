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
  Route.post('/login', 'AuthController.login').as('auth.login')
  Route.post('/refresh', 'AuthController.refresh').as('auth.refresh')
  Route.post('/register', 'AuthController.register').as('auth.register')
}).prefix('api/auth')

Route.group(async () => {
  Route.post('/logout', 'AuthController.logout')

  Route.group(async () => {
    Route.post('/devices/grant', 'DevicesController.grant').as('admin.devices.grant')
    Route.resource('/devices', 'DevicesController').apiOnly().only(['index', 'destroy', 'show']).as('admin.devices')
    Route.resource('/users', 'UsersController').apiOnly().as('admin.users')
    Route.resource('/device-types', 'DeviceTypesController').apiOnly().as('admin.device-types')
  }).prefix('admin').middleware('role:Admin').namespace('App/Controllers/Http/Admin')
  
  Route.group(async () => {
    // Route.get('/profile', 'UserController.profile')
    // Route.put('/profile', 'UserController.updateProfile')
    // Route.put('/password', 'UserController.updatePassword')
    Route.get('/device-types', 'DeviceController.getDeviceType').as('user.device-types')

    Route.resource('devices', 'DeviceController').apiOnly().as('user.devices')
    Route.post('/devices/:id/grant', 'DeviceController.grant').as('user.devices.grant')
    Route.post('/devices/:id/revoke', 'DeviceController.revoke').as('user.devices.revoke')

    Route.resource('companies', 'CompaniesController').apiOnly().as('user.companies')
    Route.resource('companies.devices', 'CompanyDeviceController').apiOnly().as('user.companies.devices')
    Route.post('companies/:company_id/devices/:id/grant', 'CompanyDeviceController.grant').as('user.companies.devices.grant')
    Route.post('companies/:company_id/devices/:id/revoke', 'CompanyDeviceController.revoke').as('user.companies.devices.revoke')

    Route.get('logs', 'DeviceController.getLog').as('user.log.get')
    Route.post('logs', 'DeviceController.sendLog').as('user.log.post')
  }).prefix('user').namespace('App/Controllers/Http/User')
}).prefix('api').middleware('auth:api')

// Route for external usage
Route.group(async () => {
  Route.post('/api/ext/device/provision', 'External/DeviceController.provision').as('ext.device.provision')
})