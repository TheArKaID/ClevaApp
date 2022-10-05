import Device from "App/Models/Device"

export default class DeviceService {
    // Get all devices
    public async getAllDevices() {
        const devices = await Device.all()
        return devices
    }

    // Get device by id
    public async getDeviceById(id: number) {
        const device = await Device.find(id)
        return device
    }

    // Get device by mac address
    public async getDeviceByMacAddress(macAddress: string) {
        const device = await Device.findBy('mac_address', macAddress)
        return device
    }

    // Create device
    public async createDevice(data: any) {
        const device = await Device.create(data)
        return device
    }

    // Update device
    public async updateDevice(id: number, data: any) {
        const device = await Device.find(id)
        if (device) {
            device.merge(data)
            await device.save()
            return device
        }
    }

    // Delete device
    public async deleteDevice(id: number) {
        const device = await Device.find(id)
        if (device) {
            await device.delete()
            return device
        }
    }
}