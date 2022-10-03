import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserService from 'App/Services/UserServices'

let userService = new UserService()

export default class UsersController {
    // List of users
    public async index({ }: HttpContextContract) {
        const users = await userService.getAllUsers()
        return {
            status: 200,
            message: 'List of users',
            data: users,
        }
    }
}
