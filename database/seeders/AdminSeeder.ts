import Factory from '@ioc:Adonis/Lucid/Factory'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Enums/Roles'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run () {
    await Factory.define(User, (faker) => {
      return {
        email: 'admin@local.host',
        password: '@ClevaID1',
        name: faker.faker.name.fullName(),
        country_code: '+62',
        phone_number: '8571234567891',
        role: Role.ADMIN
      }}).build().create()
  }
}
