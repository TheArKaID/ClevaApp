import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import DeviceType from './DeviceType'
import { v4 as uuidv4 } from 'uuid'

export default class DeviceTypeDetail extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public deviceTypeId: string

  @column()
  public key: string

  // relation device type
  @belongsTo(() => DeviceType)
  public deviceType: BelongsTo<typeof DeviceType>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(deviceTypeDetail: DeviceTypeDetail) {
    deviceTypeDetail.id = uuidv4()
  }
}
