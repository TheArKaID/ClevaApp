/* eslint-disable prettier/prettier */
import AccessDevice from "App/Models/AccessDevice"
import Device from "App/Models/Device"
import User from "App/Models/User"
import CompanyService from "./CompanyService"
import EncryptionService from "./EncryptionService"
import { Exception } from "@adonisjs/core/build/standalone"
import DeviceTypeService from "./DeviceTypeService"
import { appDerivedKey } from "Config/app"

const companyService = new CompanyService()

export default class DeviceService {
    // Get all devices
    public async getAllDevices() {
        const devices = await Device.query().preload('user').preload('company')
        return this.formatAllDeviceList(devices)
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

    /**
     * Get Device List with it's owner and user access device for User
     * @param deviceId
     * @returns 
     */
     public async getDeviceWithAccessDeviceForUser(deviceId: string, ownerId: string) {
        const device = await Device.query().where((query) => {
            query.where('owned_by', Device.ownedByUser).where('owner_id', ownerId)
        }).orWhere((query) => {
            query.where('owned_by', Device.ownedByCompany).preload('company', ($query) => {
                $query.where('owner_id', ownerId)
            })
        }).where('id', deviceId).preload('user').preload('accessDevices', ($query) => $query.preload('user')).firstOrFail()

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

    // Get device by serial number
    public async getDeviceBySerialNumber(serialNumber: string) {
        return await Device.findBy('serial_number', serialNumber)
    }

    // Get device by mac address and serial number
    public async getDeviceByMacAddressAndSerialNumber(macAddress: string, serialNumber: string) {
        return await Device.query().where('mac_address', macAddress).andWhere('serial_number', serialNumber).first()
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

        let regisData = await this.formatRegisterDeviceData(data)

        let device = await this.getDeviceByMacAddressAndSerialNumber(regisData.mac, regisData.sn)
        if (!device) {
            throw new Exception('No Device with given Mac Address and Serial Number exist', 400, 'E_DEVICE_NOT_FOUND')
        }

        let decrypted = await (new EncryptionService).decrypt(regisData.aes, appDerivedKey)
        let formatted = await this.formatRegisterDeviceData({data: 'AESDUMMY#' + decrypted})

        if (formatted.sn !== regisData.sn || formatted.mac !== regisData.mac.replace(/:/g, '')) {
            throw new Exception('Invalid AES key', 400, 'E_INVALID_AES_KEY')
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

    // Format Device Data for registration
    public async formatRegisterDeviceData(data: any) {
        const splitData = data.data.split('#')

        return {
            aes: splitData[0],
            mac: splitData[1],
            sn: splitData[2],
        }
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
        return await this.registerDeviceForUser(data)
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
    public async grantPersonalDevice(owner_id: string, device_id: string, identifier_id: string) {
        const device = await this.isOwnedByUser(device_id, owner_id)

        const accessDevice = await this.grantDevice(device, identifier_id)
        return accessDevice ?? 'Failed. User Not Found.'
    }

    // Grant User to Access Company Device
    public async grantCompanyDevice(owner_id: string, device_id: string, company_id: string, identifier_id: string) {
        await companyService.isOwnedByUser(company_id, owner_id)
        const device = await this.isOwnedByCompany(device_id, company_id)

        const accessDevice = await this.grantDevice(device, identifier_id, company_id)
        return accessDevice ?? 'Failed. User Not Found.'
    }

    // Grant user access to device
    public async grantDevice(device: Device, identifier_id: string, company_id: string | null = null) {
        // Check if identifier_id is number
        if (identifier_id.match(/^[0-9]+$/)) {
            identifier_id = await this.formatPhoneNumber(identifier_id)
        }
        
        const user = await User.query().where('email', identifier_id).orWhere('phone_number', identifier_id).first()

        if (user) {
            const key = await this.generateAccessDeviceKey(user.id, device.key)
            const accessDevice = await AccessDevice.updateOrCreate({
                userId: user.id,
                companyId: company_id,
                deviceId: device.id,
            }, {
                userId: user.id,
                companyId: company_id,
                deviceId: device.id,
                key: key
            })
            return accessDevice
        }
        return false
    }

    // Format phone number
    public async formatPhoneNumber(phone_number: string) {
        // Remove 0
        if (phone_number.startsWith('0')) {
            phone_number = phone_number.replace('0', '')
        }

        return phone_number
    }

    public async generateAccessDeviceKey(user_id: string, device_key: string) {
        const text = 'FF' + user_id + 'FF'
        return await (new EncryptionService).encrypt(text, device_key)
    }

    // Revoke User Access from Personal Device
    public async revokePersonalDevice(owner_id: string, device_id: string, identifier_id: string) {
        const device = await this.isOwnedByUser(device_id, owner_id)

        return await this.revokeDevice(device, identifier_id) ? true : 'Failed. User Not Found.'
    }

    // Revoke User Access from Company Device
    public async revokeCompanyDevice(owner_id: string, device_id: string, company_id: string, identifier_id: string) {
        await companyService.isOwnedByUser(company_id, owner_id)
        const device = await this.isOwnedByCompany(device_id, company_id)

        return await this.revokeDevice(device, identifier_id, company_id) ? true : 'Failed. User Not Found.'
    }

    // Revoke user access to device
    public async revokeDevice(device: Device, identifier_id: string, company_id: string | null = null) {
        // Check if identifier_id is number
        if (identifier_id.match(/^[0-9]+$/)) {
            identifier_id = await this.formatPhoneNumber(identifier_id)
        }
        
        const user = await User.query().where('email', identifier_id).orWhere('phone_number', identifier_id).first()

        if (user) {
            const accessDevice = await AccessDevice.query().where({
                userId: user.id,
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
        }).preload('deviceType').preload('details', ($query) => $query.select(['key'])).preload('user').preload('company')

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
                },
                type: {
                    name: device.deviceType.name,
                    characteristics: device.deviceType.characteristics
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
     * Format All Device List
     * 
     * @param devices
     * 
     * @returns {Object}
     */
    private async formatAllDeviceList(devices: Device[]) {
        return devices.map(device => {
            return {
                id: device.id,
                name: device.name,
                mac_address: device.macAddress,
                details: device.details,
                ownership: device.ownerId ? (device.ownedBy === Device.ownedByUser ? {
                    type: device.ownerType,
                    name: device.user.name,
                    id: device.ownerId
                } : {
                    type: device.ownerType,
                    name: device.company.name,
                    id: device.company.ownerId
                }) : null
            }
        })
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