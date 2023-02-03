import Factory from '@ioc:Adonis/Lucid/Factory'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Role from 'App/Enums/Roles'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run () {
    await Factory.define(User, (faker) => {
      return {
        email: 'admin@localhost',
        password: '12345678',
        name: faker.faker.name.fullName(),
        role: Role.ADMIN
      }}).build().create()
  }
}
