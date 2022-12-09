import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Device from './Device'
import DeviceTypeDetail from './DeviceTypeDetail'

export default class DeviceDetail extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public deviceId: string
  
  @column()
  public deviceTypeDetailId: string

  @column()
  public value: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Device)
  public device: BelongsTo<typeof Device>

  @belongsTo(() => DeviceTypeDetail, {
    serializeAs: 'typeDetail'
  })
  public deviceTypeDetail: BelongsTo<typeof DeviceTypeDetail>
}
