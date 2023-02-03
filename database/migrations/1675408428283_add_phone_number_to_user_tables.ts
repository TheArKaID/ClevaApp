import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('country_code', 5).after('email').nullable().defaultTo('+62')
      table.string('phone_number', 15).after('country_code').notNullable().defaultTo('')
      
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('phone_number')
      table.dropColumn('country_code')
    })
  }
}
