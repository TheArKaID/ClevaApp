import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'devices'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('device_type_id').references('device_types.id').after('id').onDelete('CASCADE')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('device_type_id')
      table.dropColumn('device_type_id')
    })
  }
}
