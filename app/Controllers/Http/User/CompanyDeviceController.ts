import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Device from 'App/Models/Device'
import CompanyService from 'App/Services/CompanyService'
import DeviceService from 'App/Services/DeviceService'

const deviceService = new DeviceService()
const companyService = new CompanyService()

export default class CompanyDeviceController {
    public async index({ auth, params }: HttpContextContract) {
        const user_id = auth.use('api').user?.id as string
        const company_id = params.company_id
        const devices = await companyService.getCompanyDevices(company_id, user_id)
        return {
            status: 200,
            message: 'List of devices',
            data: devices.map(device => {
                return {
                    id: device.id,
                    name: device.name,
                    mac_address: device.macAddress
                }
            })
        }
    }

    public async store({ params, request, auth }: HttpContextContract) {
        const data = {
            name: request.input('name'),
            mac_address: request.input('mac_address'),
            owner_id: params.company_id,
            owned_by: Device.ownedByCompany,
        }
        const user_id = auth.use('api').user?.id as string
        const device = await deviceService.createCompanyDevice(user_id, data)
        return {
            status: 200,
            message: 'Device created',
            data: device,
        }
    }

    public async update({ request, params, auth }: HttpContextContract) {
        const device_id = params.id
        const company_id = params.company_id
        const user_id = auth.use('api').user?.id as string
        const data = {
            name: request.input('name'),
            mac_address: request.input('mac_address'),
        }
        const device = await deviceService.updateCompanyDevice(user_id, device_id, company_id, data)
        let res = {
            id: device.id,
            name: device.name,
            mac_address: device.macAddress

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
        const company_id = params.company_id

        const device = await deviceService.deleteCompanyDevice(user_id, device_id, company_id)
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

}
