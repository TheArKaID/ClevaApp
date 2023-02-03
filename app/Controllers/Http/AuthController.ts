import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Role from 'App/Enums/Roles'
import UserService from 'App/Services/UserServices'
import RegisterUser from 'App/Validators/RegisterUserValidator'

let userService = new UserService()

export default class AuthController {
    public async login({ request, auth }: HttpContextContract) {
        const email = request.input('email')
        const password = request.input('password')
        const token = await auth.use('api').attempt(email, password, {
            expiresIn: '10 days',
        })
        return {
            status: 200,
            message: 'Login success',
            data: token.toJSON(),
        }
    }

    // register
    public async register({ request, auth }: HttpContextContract) {
        let data = await request.validate(RegisterUser)
        const user = await userService.createUser({ 
            name: data.name,
            email: data.email,
            password: data.password,
            role: Role.USER
         })

        const token = await auth.use('api').login(user, {
            expiresIn: '10 days',
        })
        return {
            status: 200,
            message: 'Register success',
            data: token.toJSON(),
        }
    }

    public async logout({ auth }: HttpContextContract) {
        await auth.use('api').revoke()
        return { 
            status: 200,
            message: 'Logout success'
         }
    }
}
