import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'access_devices'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('key').after('device_id')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('key')
    })
  }
}
