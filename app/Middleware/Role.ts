import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Enums/Roles'

export default class AuthMiddleware {
  /**
   * Handle request
   */
  public async handle(
    { auth }: HttpContextContract,
    next: () => Promise<void>,
    guards: string[]
  ) {
    const guardRole = guards.map(c => Role[c.toUpperCase()])

    if (!guardRole.includes(auth.user?.role)) {
      throw new Exception('You are not authorized to access this resource', 403, 'E_UNAUTHORIZED_ACCESS')
    }

    await next()
  }
}
