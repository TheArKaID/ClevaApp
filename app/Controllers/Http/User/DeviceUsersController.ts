import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DeviceService from 'App/Services/DeviceService'

const deviceService = new DeviceService()

export default class DeviceUsersController {
    public async index({auth}: HttpContextContract) {
        const id = auth.use('api').user?.id as number
        const deviceUsers = await deviceService.getUserDevices(id)
        return {
            status: 200,
            message: 'List of devices',
            data: deviceUsers.map(deviceUser => {
                return {
                    id: deviceUser.device.id,
                    name: deviceUser.device.name,
                    mac_address: deviceUser.device.macAddress,
                    is_owner: deviceUser.device.userId === id,
                }
            })
                
        }
    }

    public async store({auth, request}: HttpContextContract) {
        const data = {
            name: request.input('name'),
            mac_address: request.input('mac_address'),
            user_id: auth.use('api').user?.id,
        }
        const deviceUser = await deviceService.createDevice(data)
        return {
            status: 200,
            message: 'Device created',
            data: deviceUser,
        }
    }
    
    public async grant({ request, params, auth }: HttpContextContract) {
        const device_id = params.id
        const user_id = request.input('user_id')
        const id = auth.use('api').user?.id as number
        const device = await deviceService.grantDevice(device_id, user_id, id)

        if (typeof device !== 'string') {
            return {
                status: 200,
                message: 'Device granted successfully',
                data: device,
            }
        }

        return {
            status: 400,
            message: device
        }
    }

    public async revoke({ request, params }: HttpContextContract) {
        const id = params.id
        const user_id = request.input('user_id')
        const device = await deviceService.revokeDevice(id, user_id)

        if (typeof device !== 'string') {
            return {
                status: 200,
                message: 'Device revoked successfully',
                data: device,
            }
        }

        return {
            status: 400,
            message: device
        }
    }
}
