import { schema, CustomMessages, rules } from '@ioc:Adonis/Core/Validator'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RegisterDeviceValidator {
  constructor(protected ctx: HttpContextContract) { }

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
    deviceTypeId: schema.string(),
    name: schema.string(),
    data: schema.string({}, [
      // Accept this format: ANY#30:B0:D0:63:C2:21#DCA123456789
      rules.regex(/^(.[^/#]+)#([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})#([a-zA-Z0-9]+)$/),
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
    'deviceTypeId.required': 'Device Type ID is required',
    'name.required': 'Device name is required',
    'data.required': 'Device data is required',
    'data.regex': 'Device data is not in the correct format',
  }
}
