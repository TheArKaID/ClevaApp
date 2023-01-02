import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, beforeCreate, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Device from './Device'
import User from './User'
import { v4 as uuidv4 } from 'uuid'

export default class DeviceLog extends BaseModel {
  public static OFF = 0
  public static ON = 1

  @column({ isPrimary: true })
  public id: string

  @column()
  public deviceId: string

  @column()
  public userId: string

  @column()
  public action: number

  @column()
  public data: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => Device)
  public device: BelongsTo<typeof Device>

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @beforeCreate()
  public static assignUuid(log: DeviceLog) {
    log.id = uuidv4()
  }
}
