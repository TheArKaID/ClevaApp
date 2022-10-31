import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DeviceService from 'App/Services/DeviceService'

const deviceService = new DeviceService()

export default class DevicesController {
    public async index({auth}: HttpContextContract) {
        const devices = await deviceService.getDevicesByUser(auth.use('api').user?.id)
        return {
            status: 200,
            message: 'List of devices',
            data: devices,
        }
    }

    public async store({ request }: HttpContextContract) {
        const data = {
            name: request.input('name'),
            mac_address: request.input('mac_address'),
        }
        const device = await deviceService.createDevice(data)
        return {
            status: 200,
            message: 'Device created successfully',
            data: device,
        }
    }

    public async update({ request }: HttpContextContract) {
        const id = request.input('id')
        const data = {
            name: request.input('name'),
            mac_address: request.input('mac_address'),
        }
        const device = await deviceService.updateDevice(id, data)
        return {
            status: 200,
            message: 'Device updated successfully',
            data: device,
        }
    }

    public async destroy({ request }: HttpContextContract) {
        const id = request.input('id')
        const device = await deviceService.deleteDevice(id)
        return {
            status: 200,
            message: 'Device deleted successfully',
            data: device,
        }
    }

    public async grant({ request }: HttpContextContract) {
        const id = request.input('id')
        const user_id = request.input('user_id')
        const device = await deviceService.grantDevice(id, user_id)

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
}
