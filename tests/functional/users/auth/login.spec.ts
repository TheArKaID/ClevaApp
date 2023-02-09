import { test } from '@japa/runner'

test.group('Users login', () => {
  const endpoint = '/api/auth/login'

  test('wrong email when user login', async ({ client }) => {
    const response = await client.post(endpoint).json({
      email: 'test@local.host',
      password: '12345678',
    }).send()

    response.assertStatus(400)
    response.assertBodyContains({
      errors: [
        {
          message: "E_INVALID_AUTH_UID: User not found"
        }
      ]
    })
  })

  test('wrong password when user login', async ({ client }) => {
    const response = await client.post(endpoint).json({
      email: 'admin@local.host',
      password: '123456789',
    }).send()

    response.assertStatus(400)
    response.assertBodyContains({
      errors: [
        {
          message: "E_INVALID_AUTH_PASSWORD: Password mis-match"
        }
      ]
    })
  })

  test('a user could login', async ({ client }) => {
    const response = await client.post(endpoint).json({
      email: 'user@local.host',
      password: '@ClevaID2',
    }).send()

    response.assertStatus(200)
    response.assertBodyContains({
      status: 200,
      message: "Login success",
      data: {
        type: "bearer",
      }
    })
  })
})
