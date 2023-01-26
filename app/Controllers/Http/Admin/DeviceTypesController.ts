import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DeviceTypeService from 'App/Services/DeviceTypeService'
import CreateDeviceType from 'App/Validators/CreateDeviceTypeValidator'

const deviceTypeService = new DeviceTypeService()

export default class DeviceTypesController {
    public async index({ }: HttpContextContract) {
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

    public async store({ request }: HttpContextContract) {
        const data = await request.validate(CreateDeviceType)
        
        const deviceType = await deviceTypeService.createDeviceType(data)
        return {
            status: 200,
            message: 'Device type created',
            data: {
                "id": deviceType.id,
                "name": deviceType.name,
                "details": deviceType.deviceTypeDetail.map(detail => {
                    return {
                        "id": detail.id,
                        "key": detail.key,
                        // "unit": detail.unit,
                    }
                }),
                "characteristics": JSON.parse(deviceType.characteristics)
            },
        }
    }

    // public async update({ request, params, auth }: HttpContextContract) {
    //     const device_type_id = params.id
    //     const owner_id = auth.use('api').user?.id as string
    //     const data = {
    //         name: request.input('name'),
    //     }
    //     const deviceType = await deviceTypeService.updateDeviceType(device_type_id, owner_id, data)
    //     let res = {
    //         id: deviceType.id,
    //         name: deviceType.name,
    //         is_owner: deviceType.ownerId === owner_id

    //     }
    //     return {
    //         status: 200,
    //         message: 'Device type updated',
    //         data: res,
    //     }
    // }

    public async destroy({ params }: HttpContextContract) {
        const device_type_id = params.id

        await deviceTypeService.deleteDeviceType(device_type_id)
        return {
            status: 200,
            message: 'Device type deleted'
        }
    }
}
