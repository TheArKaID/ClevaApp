import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class GrantAccessDeviceValidator {
  constructor(protected ctx: HttpContextContract) {}

  /*
   * Define schema to validate the "shape", "type", "formatting" and "integrity" of data.
   *
   * For example:
   * 1. The username must be of data type string. But then also, it should
   *    not contain special characters or numbers.
   *    ```
   *     schema.string({}, [ rules.alpha() ])
   *    ```
   *
   * 2. The email must be of data type string, formatted as a valid
   *    email. But also, not used by any other user.
   *    ```
   *     schema.string({}, [
   *       rules.email(),
   *       rules.unique({ table: 'users', column: 'email' }),
   *     ])
   *    ```
   */
  public schema = schema.create({
    // Email nullable
    email: schema.string.optional({ trim: true }, [
      rules.email(),
      rules.exists({ table: 'users', column: 'email' }),
    ]),
    // Phone nullable
    phone: schema.string.optional({}, [
      rules.mobile({ strict: false, locale: ['id-ID'] }),
      // Start with 0
      rules.regex(/^0/),
    ]),
  })

  /**
   * Custom messages for validation failures. You can make use of dot notation `(.)`
   * for targeting nested fields and array expressions `(*)` for targeting all
   * children of an array. For example:
   *
   * {
   *   'profile.username.required': 'Username is required',
   *   'scores.*.number': 'Define scores as valid numbers'
   * }
   *
   */
  public messages: CustomMessages = {
    'email.required': 'Email is required',
    'email.email': 'Email is not valid',
    'email.exists': 'Email is not registered',
    'phone.required': 'Phone is required',
    'phone.mobile': 'Phone is not valid',
    'phone.regex': 'Phone must start with 0',
  }
}
