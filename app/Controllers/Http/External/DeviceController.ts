import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import ProvisionService from 'App/Services/ProvisionService'

const provisionService = new ProvisionService()

export default class DevicesController {
  public async index({}: HttpContextContract) {}

  public async provision({ request }: HttpContextContract) {
    // MAC 6 byte = 12 char, remove :
    let mac = request.body().mac.replace(/:/g, '')
    
    // Get Serial Number
    const sn = await provisionService.generateSN()

    // Device Key
    const dk = await provisionService.getDeviceKey(mac, sn)

    return {
      sn: sn,
      deviceKey: dk,
    }
  }

  public async update({}: HttpContextContract) {}

  public async destroy({}: HttpContextContract) {}


}
