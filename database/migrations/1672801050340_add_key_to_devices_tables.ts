import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'devices'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('key').nullable().after('mac_address')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('key')
    })
  }
}
