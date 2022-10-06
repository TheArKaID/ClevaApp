import Device from "App/Models/Device"
import DeviceUser from "App/Models/DeviceUser"
import User from "App/Models/User"

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

        this.grantDevice(device.id, data.user_id)
        
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

    // Grant user access to device
    public async grantDevice(device_id: number, user_id: number, owner_id: number = 0) {
        if (await this.isOwnedByUser(device_id, owner_id)) {
            return 'User does not own device'
        }
        
        let deviceUser = await this.checkDeviceAccess(device_id, user_id)
        if (deviceUser) {
            return deviceUser.merge({ isActive: true }).save()
        }

        const device = await Device.find(device_id)
        const user = await User.find(user_id)
        if (device && user) {
            const deviceUser = await DeviceUser.create({
                deviceId: device_id,
                userId: user_id,
            })
            return deviceUser
        }
        return 'Device or user not found'
    }

    // Get all Devices owned by User
    public async getDevicesByUser(user_id: number|undefined) {
        const devices = await Device.query().where('user_id', user_id || 0)
        return devices
    }
    
    // Revoke user access to device
    public async revokeDevice(device_id: number, user_id: number) {
        if (await this.isOwnedByUser(device_id, user_id)) {
            return 'User does not own device'
        }
        const deviceUser = await DeviceUser.query().where('device_id', device_id).where('user_id', user_id).first()
        if (deviceUser) {
            await deviceUser.merge({ isActive: false }).save()
            return deviceUser
        }
        return null
    }

    // Get all devices that can accessed by a user
    public async getUserDevices(user_id: number) {
        const deviceUsers = await DeviceUser.query().where('user_id', user_id).preload('device')
        return deviceUsers
    }

    // Check if user has access to device
    public async checkDeviceAccess(device_id: number, user_id: number) {
        const deviceUser = await DeviceUser.query().where('device_id', device_id).where('user_id', user_id).first()
        if (deviceUser) {
            return deviceUser
        }
        return false
    }

    // Check if user owns device
    public async isOwnedByUser(device_id: number, owner_id: number) {
        const device = await Device.query().where('id', device_id).where('user_id', owner_id).first()
        if (device) {
            return true
        }
        return false
    }
}