import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DeviceService from 'App/Services/DeviceService'

const deviceService = new DeviceService()

export default class DevicesController {
    public async index({ auth }: HttpContextContract) {
        const user_id = auth.use('api').user?.id as string
        const devices = await deviceService.getAllDevices(user_id)
        return {
            status: 200,
            message: 'List of devices',
            data: devices,
        }
    }

    public async destroy({ request }: HttpContextContract) {
        const id = request.input('id')
        const device = await deviceService.clearDeviceOwner(id)
        return {
            status: 200,
            message: 'Device owner cleared. Please re assign to use it.',
            data: device,
        }
    }

    public async show({ params }:HttpContextContract) {
        const id = params.id
        const device = await deviceService.getDeviceWithAccessDevice(id)

        if (typeof device !== 'string') {
            return {
                status: 200,
                message: 'Device details',
                data: device,
            }
        }

        return {
            status: 400,
            message: device
        }
    }

    public async grant({ request }: HttpContextContract) {
        const device_id = request.body().device_id
        const user_id = request.body().user_id
        let device = await deviceService.getDeviceById(device_id)
        await deviceService.grantDevice(device, user_id)

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
