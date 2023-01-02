import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Device from 'App/Models/Device'
import DeviceService from 'App/Services/DeviceService'

const deviceService = new DeviceService()

export default class DeviceController {
    public async index({ auth }: HttpContextContract) {
        const owner_id = auth.use('api').user?.id as string
        const devices = await deviceService.getUserAccessDevices(owner_id)
        return {
            status: 200,
            message: 'List of devices',
            data: devices
        }
    }

    public async store({ auth, request }: HttpContextContract) {
        const data = {
            name: request.input('name'),
            mac_address: request.input('mac_address'),
            owner_id: auth.use('api').user?.id,
            owned_by: Device.ownedByUser,
        }
        const deviceUser = await deviceService.createDevice(data)
        return {
            status: 200,
            message: 'Device created',
            data: deviceUser,
        }
    }

    public async update({ request, params, auth }: HttpContextContract) {
        const device_id = params.id
        const owner_id = auth.use('api').user?.id as string
        const data = {
            name: request.input('name'),
            mac_address: request.input('mac_address'),
        }
        const device = await deviceService.updateDevice(device_id, owner_id, data)
        let res = {
            id: device.id,
            name: device.name,
            mac_address: device.macAddress,
            is_owner: device.ownerId === owner_id

        }
        return {
            status: 200,
            message: 'Device updated',
            data: res,
        }
    }

    public async destroy({ params, auth }: HttpContextContract) {
        const user_id = auth.use('api').user?.id as string
        const device_id = params.id

        const device = await deviceService.deleteDevice(device_id, user_id)
        return {
            status: 200,
            message: 'Device deleted',
            data: device,
        }
    }

    public async grant({ request, params, auth }: HttpContextContract) {
        const device_id = params.id
        const user_id = request.input('user_id')
        const id = auth.use('api').user?.id as string
        const device = await deviceService.grantPersonalDevice(id, device_id, user_id)

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

    public async revoke({ request, params, auth }: HttpContextContract) {
        const device_id = params.id
        const user_id = request.input('user_id')
        const owner_id = auth.use('api').user?.id as string

        const device = await deviceService.revokePersonalDevice(owner_id, device_id, user_id)

        if (typeof device !== 'string') {
            return {
                status: 200,
                message: 'Device revoked successfully'
            }
        }

        return {
            status: 400,
            message: device
        }
    }
    
    public async getLog({ auth }: HttpContextContract) {
        const user_id = auth.use('api').user?.id as string

        const logs = await deviceService.getUserDeviceLogs(user_id)
        return {
            status: 200,
            message: 'Device log',
            data: logs
        }
    }
    
    public async sendLog({ request, auth }: HttpContextContract) {
        const device_id = request.input('id')
        const user_id = auth.use('api').user?.id as string
        const data = {
            action: request.input('action'),
            data: request.input('data'),
        }
        const log = await deviceService.logUserDevice(user_id, device_id, data)
        return {
            status: 200,
            message: 'Logged',
            data: log,
        }
    }
}
