import { test } from '@japa/runner'
import Route from '@ioc:Adonis/Core/Route'
import DeviceType from 'App/Models/DeviceType'
import EncryptionService from 'App/Services/EncryptionService'
import Device from 'App/Models/Device'

test.group('Users device', () => {
  // const endpoint = Route.makeUrl('user.devices.store', { user_id: 1 })
  const admin = {
    email: 'admin@local.host',
    password: '@ClevaID1'
  }
  const user = {
    email: 'user@local.host',
    password: '@ClevaID2'
  }
  let deviceType = {
    id: undefined,
    name: 'Test Device Type',
    characteristics: { "RELAY_UUID": "3559f95b-3857-43f1-a7e0-cc0ab0542afc", "SERVICE_UUID": "de1bf7ab-1ca8-40a3-b797-6221c2acb33d" },
    details: [
      {
        key: 'Test Detail'
      }
    ]
  }

  let device = {
    id: '',
    name: 'Test Device',
    device_type_id: undefined,
    mac: '30:B0:D0:63:C2:21',
    sn: '',
    data: ''
  }

  test('init device test', async ({ client }) => {
    const loginReq = await client.post(Route.makeUrl('auth.login')).json(admin).send()
    loginReq.assertStatus(200)

    const token = loginReq.body().data.token

    // Store device type
    const deviceTypeReq = await client.post(Route.makeUrl('admin_device_types.store')).json(deviceType).header('Authorization', `Bearer ${token}`).send()
    deviceTypeReq.assertStatus(200)
    deviceType = deviceTypeReq.body().data

    device.device_type_id = deviceType.id

    // Provision Device
    const provisionReq = await client.post(Route.makeUrl('ext.device.provision')).json({ mac: device.mac }).header('Authorization', `Bearer ${token}`).send()
    provisionReq.assertStatus(200)
    device.id = provisionReq.body().data.id
    device.sn = provisionReq.body().data.sn
    device.data = provisionReq.body().data.deviceKey + '#' + device.mac + '#' + device.sn
  })

  test('a user could add a device', async ({ client }) => {
    const loginReq = await client.post(Route.makeUrl('auth.login')).json(user).send()
    loginReq.assertStatus(200)

    const token = loginReq.body().data.token
    const response = await client.post(Route.makeUrl('user_devices.store')).json({
      name: device.name,
      deviceTypeId: device.device_type_id,
      data: device.data
    }).header('Authorization', `Bearer ${token}`).send()

    response.assertStatus(200)

  })

})
