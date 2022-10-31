/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }
  public async handle(error: any, ctx: HttpContextContract) {
    /**
     * Self handle the validation exception
     */
    if (ctx.request.url().split('/')[1] == 'api') {
      if (error.code === 'E_ROW_NOT_FOUND') {
        console.log(Object.getPrototypeOf(Object.getPrototypeOf(error).constructor).name)
        return ctx.response.send({
          'status': 400,
          'message': 'Failed. ' + typeof error + ' Not Found.'
        })
      }

      if (error.code === 'E_ROUTE_NOT_FOUND') {
        return ctx.response.send({
          'status': 404,
          'message': 'Failed. Resources not Found.'
        })
      }
    }
    /**
     * Forward rest of the exceptions to the parent class
     */
    return super.handle(error, ctx)
  }

}
