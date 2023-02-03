import Factory from '@ioc:Adonis/Lucid/Factory'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class extends BaseSeeder {
  public async run () {
    // Create Admin User
    await Factory.define(User, (faker) => {
      return {
        email: 'admin@localhost',
        password: '12345678',
        name: faker.faker.name.fullName(),
      }}).build().create()
  }
}
