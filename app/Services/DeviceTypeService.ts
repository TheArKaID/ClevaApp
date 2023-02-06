import DeviceType from "App/Models/DeviceType"

export default class DeviceTypeService {
    // Find device type by id
    public async getDeviceTypeById(id: string) {
        return await DeviceType.query().where('id', id).preload('deviceTypeDetail').first()
    }

    // Get All Device Type
    public async getDeviceTypes() {
        const deviceTypes = await DeviceType.query().preload('deviceTypeDetail')
        return deviceTypes
    }

    // Create Device Type
    public async createDeviceType(data: any) {
        const deviceType = await DeviceType.create({
            name: data.name,
            characteristics: JSON.stringify(data.characteristics),
        })
        await deviceType.related('deviceTypeDetail').createMany(data.details)
        await deviceType.load('deviceTypeDetail')
        return deviceType
    }

    // Delete Device Type
    public async deleteDeviceType(id: string) {
        const deviceType = await DeviceType.query().where('id', id).preload('deviceTypeDetail').firstOrFail()
        await deviceType.delete()
        return true
    }
}