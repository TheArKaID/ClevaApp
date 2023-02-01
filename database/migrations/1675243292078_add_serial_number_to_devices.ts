import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'devices'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('serial_number').after('mac_address').notNullable().defaultTo(null)
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('serial_number')
    })
  }
}
