import { test } from '@japa/runner'

test.group('Users register', () => {
  const endpoint = '/api/auth/register'

  test('phone number must be correctly formatted', async ({ client }) => {
    const response = await client.post(endpoint).json({
      email: 'test@local.host',
      password: '@ClevaTest1',
      name: 'Test User',
      country_code: '+62',
      phone_number: '123'
    }).send()

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: "regex",
          field: "phone_number",
          message: "Phone number must be in format 81234567891"
        }
      ]
    })
  })

  test('email must be unique', async ({ client }) => {
    const response = await client.post(endpoint).json({
      email: 'admin@local.host',
      password: '@ClevaTest1',
      name: 'Test User',
      country_code: '+62',
      phone_number: '1234567891'
    }).send()

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: "unique",
          field: "email",
          message: "Email is already registered"
        }
      ]
    })
  })

  test('password must be correctly formatted', async ({ client }) => {
    const response = await client.post(endpoint).json({
      email: 'test@local.host',
      password: 'ClevaApp',
      name: 'Test User',
      country_code: '+62',
      phone_number: '1234567891'
    }).send()

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: "regex",
          field: "password",
          message: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"
        }
      ]
    })
  })

  test('country code must be correctly formatted', async ({ client }) => {
    const response = await client.post(endpoint).json({
      email: 'test@local.host',
      password: 'ClevaApp',
      name: 'Test User',
      country_code: '1234',
      phone_number: '1234567891'
    }).send()

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [
        {
          rule: "regex",
          field: "country_code",
          message: "Country code must start with + and followed by 1-3 digits"
        }
      ]
    })
  })

  test('a user could register', async ({ client }) => {
    const response = await client.post(endpoint).json({
      email: 'test@localhost.test',
      password: '@ClevaTest1',
      name: 'Test User',
      country_code: '+62',
      phone_number: '123456789'
    }).send()

    response.assertStatus(200)
    response.assertBodyContains({
      status: 200,
      message: "Register success"
    })
  })
})
