import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import Device from './Device'
import DeviceTypeDetail from './DeviceTypeDetail'

export default class DeviceType extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public characteristics: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
  
  @hasMany(() => Device)
  public devices: HasMany<typeof Device>

  @hasMany(() => DeviceTypeDetail, {
    serializeAs: "details"
  })
  public deviceTypeDetail: HasMany<typeof DeviceTypeDetail>

  @beforeCreate()
  public static assignUuid(deviceType: DeviceType) {
    deviceType.id = uuidv4()
  }
}
