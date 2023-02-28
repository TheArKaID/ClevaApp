import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DeviceService from 'App/Services/DeviceService'
import ProvisionService from 'App/Services/ProvisionService'

const provisionService = new ProvisionService()
const deviceService = new DeviceService()

export default class DevicesController {
  public async index({ }: HttpContextContract) { }

  public async provision({ request }: HttpContextContract) {
    // MAC 6 byte = 12 char, remove :
    let mac = request.body().mac

    const device = await deviceService.getDeviceByMacAddress(mac)

    // Return mac already registered
    if (device) {
      return {
        status: 400,
        message: 'Device already registered',
      }
    }

    // Get Serial Number
    const sn = await provisionService.generateSN()

    // Device Key
    const dk = await provisionService.getDeviceKey(mac.replace(/:/g, ''), sn)

    await deviceService.createDevice({
      mac_address: mac,
      serial_number: sn,
      name: '',
      key: dk,
      owned_by: null,
      owner_id: null,
      device_type_id: null,
    })

    return {
      status: 200,
      message: 'Device provisioned successfully',
      data: {
        sn: sn,
        deviceKey: dk.substring(0, 16),
      }
    }
  }

  public async update({ }: HttpContextContract) { }

  public async destroy({ }: HttpContextContract) { }


}
