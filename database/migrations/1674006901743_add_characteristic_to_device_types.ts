import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'device_types'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('characteristics').after('name')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('characteristics')
    })
  }
}
