import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegisterUserValidator {
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
    name: schema.string({}, [
      rules.maxLength(255),
    ]),
    email: schema.string({}, [
      rules.email(),
      rules.maxLength(255),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    password: schema.string({}, [
      rules.regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      ),
    ]),
    country_code: schema.string({}, [
      rules.regex(
        /^\+\d{1,4}$/,
      ),
    ]),
    phone_number: schema.string({}, [
      rules.regex(
        /^\d{1,3}\d{8,15}$/,
      ),
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
    'name.required': 'Name is required',
    'name.maxLength': 'Name is too long',
    'email.required': 'Email is required',
    'email.email': 'Email is invalid',
    'email.maxLength': 'Email is too long',
    'email.unique': 'Email is already registered',
    'password.required': 'Password is required',
    'password.regex': 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
    'phone_number.required': 'Phone number is required',
    'phone_number.regex': 'Phone number must be in format 81234567891',
    'country_code.required': 'Country code is required',
    'country_code.regex': 'Country code must start with + and followed by 1-4 digits',
  }
}
