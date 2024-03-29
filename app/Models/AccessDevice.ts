import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuidv4 } from 'uuid'
import User from './User'
import Company from './Company'
import Device from './Device'

export default class AccessDevice extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column()
  public companyId: string | null

  @column()
  public deviceId: string

  @column()
  public key: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @belongsTo(() => User)
  public user: BelongsTo<typeof User>

  @belongsTo(() => Company)
  public company: BelongsTo<typeof Company>

  @belongsTo(() => Device)
  public device: BelongsTo<typeof Device>
  
  @beforeCreate()
  public static assignUuid(accessDevice: AccessDevice) {
    accessDevice.id = uuidv4()
  }
}
