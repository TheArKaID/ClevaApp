import AccessDevice from "App/Models/AccessDevice"
import Device from "App/Models/Device"
import User from "App/Models/User"
import CompanyService from "./CompanyService"
import EncryptionService from "./EncryptionService"
import { Exception } from "@adonisjs/core/build/standalone"
import DeviceTypeService from "./DeviceTypeService"

const companyService = new CompanyService()

export default class DeviceService {
    // Get all devices
    public async getAllDevices(user_id: string) {
        const devices = await Device.query().whereNotNull('device_type_id').preload('details', ($query) => {
            $query.select(['key'])
        }).preload('user').preload('company')
        return this.formatDeviceList(devices, user_id)
    }

    // Get device by id
    public async getDeviceById(id: string) {
        const device = await Device.findOrFail(id)
        return device
    }

    /**
     * Get Device List with it's owner and user access device
     * @param deviceId
     * @returns 
     */
    public async getDeviceWithAccessDevice(deviceId: string) {
        const device = await Device.query().where('id', deviceId).preload('user').preload('accessDevices', ($query) => $query.preload('user')).firstOrFail()
    
        return {
            id: device.id,
            name: device.name,
            mac_address: device.macAddress,
            owned_by: device.ownedBy,
            owner: device.ownedBy === Device.ownedByUser ? {
                id: device.user.id,
                name: device.user.name,
                email: device.user.email
            } : {
                id: device.company.id,
                name: device.company.name
            },
            user_access_devices: {
                count: device.accessDevices.length,
                data: device.accessDevices.map((accessDevice) => {
                    return {
                        id: accessDevice.id,
                        user: {
                            id: accessDevice.user.id,
                            name: accessDevice.user.name,
                            email: accessDevice.user.email
                        }
                    }
                })
            },
        }
        
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

    // Register device for user
    public async registerDeviceForUser(data: any) {
        const deviceTypeService = new DeviceTypeService

        if (!(await deviceTypeService.getDeviceTypeById(data.deviceTypeId))) {
            throw new Exception('Device type not found', 400, 'E_DEVICE_TYPE_NOT_FOUND')
        }

        let device = await this.getDeviceByMacAddress(data.mac_address)

        if (!device) {
            throw new Exception('No Device with given Mac Address exist', 400, 'E_DEVICE_NOT_FOUND')
        }

        if (device.ownerId) {
            throw new Exception('Device already registered', 400, 'E_DEVICE_ALREADY_REGISTERED')
        }

        device.ownedBy = data.owned_by
        device.ownerId = data.owner_id
        device.deviceTypeId = data.deviceTypeId
        device.name = data.name
        await device.save()

        return device
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

    // Unregister device
    public async unregisterDevice(device_id: string, owner_id: string) {
        const device = await this.isOwnedByUser(device_id, owner_id)
        device.ownedBy = null
        device.ownerId = null
        device.deviceTypeId = null
        device.name = ''
        return device.save()
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
            const key = await this.generateAccessDeviceKey(user_id, device.key)
            const accessDevice = await AccessDevice.updateOrCreate({
                userId: user_id,
                companyId: company_id,
                deviceId: device.id,
            }, {
                userId: user_id,
                companyId: company_id,
                deviceId: device.id,
                key: key
            })
            return accessDevice
        }
        return false
    }

    public async generateAccessDeviceKey(user_id:string, device_key: string) {
        const text = 'FF' + user_id + 'FF'
        return await (new EncryptionService).encrypt(text, device_key)
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
        }).preload('details', ($query) => $query.select(['key'])).preload('user').preload('company')

        return this.formatDeviceList(devices, user_id)
    }

    public async getUserDeviceLogs(user_id: string) {
        const device = await Device.query().select(['id', 'name', 'mac_address']).where(($query) => {
            $query.where('owned_by', Device.ownedByUser).andWhere('owner_id', user_id)
        }).orWhere(($query) => {
            $query.where('owned_by', Device.ownedByCompany).andWhereIn('owner_id', ($query) => {
                $query.select('id').from('companies').where('owner_id', user_id)
            })
        }).orWhereIn('id', ($query) => {
            $query.select('device_id').from('access_devices').where('user_id', user_id)
        }).preload('logs', (query) => {
            query.select(['id', 'action', 'data']).where('user_id', user_id).orderBy('created_at', 'desc')
        })

        return device
    }

    public async logUserDevice(user_id: string, device_id: string, data: any) {
        const device = await Device.query().select(['id', 'deviceTypeId']).where('id', device_id).where(($query) => {
            $query.where('owned_by', Device.ownedByUser).andWhere('owner_id', user_id)
        }).orWhere(($query) => {
            $query.where('owned_by', Device.ownedByCompany).andWhereIn('owner_id', ($query) => {
                $query.select('id').from('companies').where('owner_id', user_id)
            })
        }).orWhereIn('id', ($query) => {
            $query.select('device_id').from('access_devices').where('user_id', user_id)
        }).preload('details', ($query) => $query.select(['key'])).firstOrFail()

        let newData = {};
        for (const detail of device.details) {
            newData[detail.key] = data.data[detail.key] || ''
        }

        const log = await device.related('logs').create({
            deviceId: device_id,
            userId: user_id,
            action: data.action,
            data: newData as string
        });


        return log
    }

    /**
     * Format Device List
     * @param devices
     * @param user_id
     * 
     * @returns {Object}
     */
    private formatDeviceList(devices: Device[], user_id: string) {
        return devices.reduce((acc: any, device: Device) => {
            const data = {
                id: device.id,
                name: device.name,
                mac_address: device.macAddress,
                details: device.details,
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
            if (device.ownedBy === Device.ownedByUser) {
                acc.personal.push(data)
            } else {
                acc.company.push(data)
            }
            return acc
        }, { personal: [], company: [] })
    }

    /**
     * Clear device owner
     * 
     * @param device_id
     * 
     * @returns boolean
     */
    public async clearDeviceOwner(device_id: string) {
        const device = await Device.findOrFail(device_id)
        device.ownerId = null
        device.ownedBy = null
        await device.save()

        return true
    }
}