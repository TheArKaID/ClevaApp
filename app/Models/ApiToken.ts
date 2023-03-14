import { DateTime } from 'luxon'
import { column, BaseModel, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import User from './User'

export default class ApiToken extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public user_id: string

  @column()
  public name: string

  @column()
  public type: string

  @column()
  public phone_number: string

  @column()
  public tokene: string

  @column.dateTime()
  public expiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @belongsTo(() => User, { foreignKey: 'user_id', localKey: 'id' })
  public user: BelongsTo<typeof User>
}
