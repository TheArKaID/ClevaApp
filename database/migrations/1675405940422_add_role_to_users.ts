import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.tinyint('role').notNullable().defaultTo(2).after('password')
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role')
    })
  }
}
