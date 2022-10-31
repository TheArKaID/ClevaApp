import Company from "App/Models/Company"
import Device from "App/Models/Device"

export default class CompanyService {
    // Get all companies
    public async getAllCompanies() {
        const companies = await Company.all()
        return companies
    }

    // Get company by id
    public async getCompanyById(id: number) {
        const company = await Company.find(id)
        return company
    }

    // Get Companies by user id
    public async getUserCompanies(user_id: string) {
        return await Company.query().where('owner_id', user_id)
    }

    // Create company
    public async createCompany(data: any) {
        const company = await Company.create(data)
        return company
    }

    // Update company
    public async updateCompany(id: string, owner_id: string, data: any) {
        const company = await this.isOwnedByUser(id, owner_id)
        if (company) {
            company.merge(data)
            return await company.save()
        }
        return null
    }

    // Delete company
    public async deleteCompany(id: string, owner_id: string) {
        const company = await this.isOwnedByUser(id, owner_id)
        if (company) {
            await company.delete()
            return true
        }
        return false
    }

    // Check company ownership
    public async isOwnedByUser(company_id: string, owner_id: string) {
        return await Company.query().where('id', company_id).where('owner_id', owner_id).firstOrFail()
    }

    // Get devices owned by Company
    public async getCompanyDevices(company_id: string, owner_id: string) {
        this.isOwnedByUser(company_id, owner_id);
        return await Device.query().where('owned_by', Device.ownedByCompany).where('owner_id', company_id)
    }
}