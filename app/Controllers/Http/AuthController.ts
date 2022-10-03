import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

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

    public async logout({ auth }: HttpContextContract) {
        await auth.use('api').revoke()
        return { 
            status: 200,
            message: 'Logout success'
         }
    }

    // register
    public async register({ request, auth }: HttpContextContract) {
        const email = request.input('email')
        const password = request.input('password')
        const name = request.input('name')
        const user = await User.create({ email, password, name })
        
        await user.save();
        const token = await auth.use('api').attempt(email, password, {
            expiresIn: '1 day',
        })
        return {
            status: 200,
            message: 'Register success',
            data: token.toJSON(),
        }
    }
}
