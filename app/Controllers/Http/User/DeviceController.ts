import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Device from 'App/Models/Device'
import DeviceService from 'App/Services/DeviceService'
import DeviceTypeService from 'App/Services/DeviceTypeService'
import GrantAccessDeviceValidator from 'App/Validators/GrantAccessDeviceValidator'
import RegisterDevice from 'App/Validators/RegisterDeviceValidator'
import RevokeAccessDeviceValidator from 'App/Validators/RevokeAccessDeviceValidator'
import UpdateDevice from 'App/Validators/UpdateDeviceValidator'

const deviceService = new DeviceService()
const deviceTypeService = new DeviceTypeService()

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
        let data = await request.validate(RegisterDevice)

        data['owner_id'] = auth.use('api').user?.id
        data['owned_by'] = Device.ownedByUser

        const deviceUser = await deviceService.registerDeviceForUser(data)

        return {
            status: 200,
            message: 'Device Registered',
            data: deviceUser,
        }
    }

    public async show({ params, auth }: HttpContextContract) {
        const device_id = params.id
        const owner_id = auth.use('api').user?.id as string
        const device = await deviceService.getDeviceWithAccessDeviceForUser(device_id, owner_id)

        return {
            status: 200,
            message: 'Device found',
            data: device
        }
    }
    public async update({ request, params, auth }: HttpContextContract) {
        let data = await request.validate(UpdateDevice)

        const device_id = params.id
        const owner_id = auth.use('api').user?.id as string
        
        const device = await deviceService.updateDevice(device_id, owner_id, data)

        return {
            status: 200,
            message: 'Device updated',
            data: {
                id: device.id,
                name: device.name,
                mac_address: device.macAddress,
                is_owner: device.ownerId === owner_id
            },
        }
    }

    public async destroy({ params, auth }: HttpContextContract) {
        const user_id = auth.use('api').user?.id as string
        const device_id = params.id

        await deviceService.unregisterDevice(device_id, user_id)
        return {
            status: 200,
            message: 'Device unregistered'
        }
    }

    public async grant({ request, params, auth }: HttpContextContract) {
        let data = await request.validate(GrantAccessDeviceValidator)

        const device_id = params.id
        const id = auth.use('api').user?.id as string
        const device = await deviceService.grantPersonalDevice(id, device_id, data.email ?? data.phone ?? '')

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
        let data = await request.validate(RevokeAccessDeviceValidator)

        const device_id = params.id
        const owner_id = auth.use('api').user?.id as string

        const device = await deviceService.revokePersonalDevice(owner_id, device_id,  data.email ?? data.phone ?? '')

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

    public async getDeviceType({ }: HttpContextContract) {
        const deviceTypes = await deviceTypeService.getDeviceTypes()
        return {
            status: 200,
            message: 'List of device types',
            data: deviceTypes.map(deviceType => {
                return {
                    "id": deviceType.id,
                    "name": deviceType.name,
                    "details": deviceType.deviceTypeDetail.map(detail => {
                        return {
                            "id": detail.id,
                            "key": detail.key
                        }
                    }),
                    "characteristics": deviceType.characteristics,
                    "created_at": deviceType.createdAt,
                }
            })
        }
    }
}
