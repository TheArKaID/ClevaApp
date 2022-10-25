import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import CompanyService from 'App/Services/CompanyService'

const companyService = new CompanyService()

export default class CompaniesController {
    public async index({ auth }: HttpContextContract) {
        const owner_id = auth.use('api').user?.id as string
        const companies = await companyService.getUserCompanies(owner_id)

        return {
            status: 200,
            message: 'List of companies',
            data: companies
        }
    }

    public async store({ auth, request }: HttpContextContract) {
        const data = {
            name: request.input('name'),
            owner_id: auth.use('api').user?.id,
        }
        const company = await companyService.createCompany(data)
        return {
            status: 200,
            message: 'Company created',
            data: company,
        }
    }

    public async update({ request, params, auth }: HttpContextContract) {
        const company_id = params.id
        const user_id = auth.use('api').user?.id as string
        const data = {
            name: request.input('name')
        }
        const company = await companyService.updateCompany(company_id, user_id, data)
        return {
            status: 200,
            message: 'Company updated',
            data: company,
        }
    }

    public async destroy({ params, auth }: HttpContextContract) {
        const company_id = params.id
        const user_id = auth.use('api').user?.id as string
        await companyService.deleteCompany(company_id, user_id)
        return {
            status: 200,
            message: 'Company deleted'
        }
    }
}
