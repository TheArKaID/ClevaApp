import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, BelongsTo, belongsTo, column, computed, HasMany, hasMany, HasManyThrough, hasManyThrough } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Company from './Company'
import { v4 as uuidv4 } from 'uuid'
import AccessDevice from './AccessDevice'
import DeviceType from './DeviceType'
import DeviceLog from './DeviceLog'
import DeviceTypeDetail from './DeviceTypeDetail'

export default class Device extends BaseModel {
  public static ownedByUser = 1
  public static ownedByCompany = 2

  @column({ isPrimary: true })
  public id: string

  @column()
  public deviceTypeId: string

  @column()
  public ownerId: string | null

  @column()
  public ownedBy: number | null

  @column()
  public name: string

  @column()
  public macAddress: string

  @column()
  public serialNumber: string

  @column()
  public key: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get ownerType() {
    return this.ownedBy === Device.ownedByUser ? 'Personal' : 'Company'
  }

  @belongsTo(() => DeviceType, {
    serializeAs: "type"
  })
  public deviceType: BelongsTo<typeof DeviceType>

  // Belongs to user or company
  @belongsTo(() => User, { foreignKey: 'ownerId', localKey: 'id' })
  public user: BelongsTo<typeof User>
  @belongsTo(() => Company, { foreignKey: 'ownerId', localKey: 'id' })
  public company: BelongsTo<typeof Company>

  @hasMany(() => AccessDevice)
  public accessDevices: HasMany<typeof AccessDevice>

  @hasMany(() => DeviceLog)
  public logs: HasMany<typeof DeviceLog>

  @hasManyThrough([ () => DeviceTypeDetail, () => DeviceType ], {
    localKey: 'deviceTypeId',
    foreignKey: 'id',
    throughLocalKey: 'id',
    throughForeignKey: 'deviceTypeId'
  })
  public details: HasManyThrough<typeof DeviceTypeDetail>
  
  @beforeCreate()
  public static assignUuid(device: Device) {
    device.id = uuidv4()
  }
}
