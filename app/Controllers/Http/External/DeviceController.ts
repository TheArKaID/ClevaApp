import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import DeviceService from 'App/Services/DeviceService'
import ProvisionService from 'App/Services/ProvisionService'

const provisionService = new ProvisionService()
const deviceService = new DeviceService()

export default class DevicesController {
  public async index({}: HttpContextContract) {}

  public async provision({ request }: HttpContextContract) {
    // MAC 6 byte = 12 char, remove :
    let mac = request.body().mac.replace(/:/g, '')
    
    // Get Serial Number
    const sn = await provisionService.generateSN()

    // Device Key
    const dk = await provisionService.getDeviceKey(mac, sn)

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
      sn: sn,
      deviceKey: dk,
    }
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}


}
