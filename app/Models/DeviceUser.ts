import { DateTime } from 'luxon'
import { BaseModel, belongsTo, BelongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Device from './Device'
import User from './User'

export default class DeviceUser extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public deviceId: number

  @column()
  public userId: number

  @column()
  public isActive: boolean

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Device)
  public device: BelongsTo<typeof Device>

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>
}
