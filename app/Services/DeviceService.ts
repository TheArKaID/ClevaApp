import AccessDevice from "App/Models/AccessDevice"
import Device from "App/Models/Device"
import User from "App/Models/User"
import CompanyService from "./CompanyService"

const companyService = new CompanyService()

export default class DeviceService {
    // Get all devices
    public async getAllDevices() {
        const devices = await Device.all()
        return devices
    }

    // Get device by id
    public async getDeviceById(id: string) {
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
        return await Device.create(data)
    }

    // Update device
    public async updateDevice(device_id: string, owner_id: string, data: any) {
        const device = await this.isOwnedByUser(device_id, owner_id)
        device.merge(data)
        return device.save()
    }

    // Delete device
    public async deleteDevice(device_id: string, owner_id: string) {
        const device = await this.isOwnedByUser(device_id, owner_id)

        return await device.delete()
    }

    // Create device for Company
    public async createCompanyDevice(user_id: string, data: any) {
        await companyService.isOwnedByUser(data.owner_id, user_id)
        return await this.createDevice(data)
    }

    // Update device
    public async updateCompanyDevice(user_id: string, device_id: string, company_id: string, data: any) {
        await companyService.isOwnedByUser(company_id, user_id)
        const device = await this.isOwnedByCompany(device_id, company_id)
        device.merge(data)
        return device.save()
    }

    // Delete device for Company
    public async deleteCompanyDevice(user_id: string, device_id: string, company_id: string) {
        await companyService.isOwnedByUser(company_id, user_id)
        const device = await this.isOwnedByCompany(device_id, company_id)
        return await device.delete()
    }

    // Check Personal Device Ownership
    public async isOwnedByUser(device_id: string, owner_id: string) {
        return await Device.query().where('id', device_id).where('owned_by', Device.ownedByUser).where('owner_id', owner_id).firstOrFail()
    }

    // Check Company Device Ownership
    public async isOwnedByCompany(device_id: string, company_id: string) {
        return await Device.query().where('id', device_id).where('owned_by', Device.ownedByCompany).where('owner_id', company_id).firstOrFail()
    }

    // Grant User to Access Personal Device
    public async grantPersonalDevice(owner_id: string, device_id: string, user_id: string) {
        const device = await this.isOwnedByUser(device_id, owner_id)

        return await this.grantDevice(device, user_id) ? true : 'Failed. User Not Found.'
    }

    // Grant User to Access Company Device
    public async grantCompanyDevice(owner_id: string, device_id: string, company_id: string, user_to_grant_id: string) {
        await companyService.isOwnedByUser(company_id, owner_id)
        const device = await this.isOwnedByCompany(device_id, company_id)

        return await this.grantDevice(device, user_to_grant_id, company_id) ? true : 'Failed. User Not Found.'
    }

    // Grant user access to device
    public async grantDevice(device: Device, user_id: string, company_id: string | null = null) {
        const user = await User.find(user_id)
        if (user) {
            const accessDevice = await AccessDevice.updateOrCreate({
                userId: user_id,
                companyId: company_id,
                deviceId: device.id,
            }, {
                userId: user_id,
                companyId: company_id,
                deviceId: device.id,
            })
            return accessDevice
        }
        return false
    }

    // Revoke User Access from Personal Device
    public async revokePersonalDevice(owner_id: string, device_id: string, user_id: string) {
        const device = await this.isOwnedByUser(device_id, owner_id)

        return await this.revokeDevice(device, user_id) ? true : 'Failed. User Not Found.'
    }

    // Revoke User Access from Company Device
    public async revokeCompanyDevice(owner_id: string, device_id: string, company_id: string, user_to_revoke_id: string) {
        await companyService.isOwnedByUser(company_id, owner_id)
        const device = await this.isOwnedByCompany(device_id, company_id)
        
        return await this.revokeDevice(device, user_to_revoke_id, company_id) ? true : 'Failed. User Not Found.'
    }

    // Revoke user access to device
    public async revokeDevice(device: Device, user_id: string, company_id: string | null = null) {
        const user = await User.find(user_id)
        
        if (user) {
            const accessDevice = await AccessDevice.query().where({
                userId: user_id,
                companyId: company_id,
                deviceId: device.id,
            }).firstOrFail()
            await accessDevice.delete()
            return true
        }
        return false
    }

    // Get Devices that can be accessed by the User
    public async getUserAccessDevices(user_id: string) {
        const devices = await Device.query().where(($query) => {
            $query.where('owned_by', Device.ownedByUser).andWhere('owner_id', user_id)
        }).orWhere(($query) => {
            $query.where('owned_by', Device.ownedByCompany).andWhereIn('owner_id', ($query) => {
                $query.select('id').from('companies').where('owner_id', user_id)
            })
        }).orWhereIn('id', ($query) => {
            $query.select('device_id').from('access_devices').where('user_id', user_id)
        }).preload('accessDevices').preload('user').preload('company')

        return devices.map(device => {
            return {
                id: device.id,
                name: device.name,
                mac_address: device.macAddress,
                ownership: device.ownedBy === Device.ownedByUser ? {
                    type: device.ownerType,
                    is_owner: device.ownerId === user_id,
                    name: device.user.name
                } : {
                    type: device.ownerType,
                    is_owner: device.company.ownerId === user_id,
                    name: device.company.name
                }
            }
        })
    }
}