import User from "App/Models/User"

export default class UserService {
    // Get all users
    public async getAllUsers() {
        const users = await User.all()
        return users
    }

    // Get user by id
    public async getUserById(id: number) {
        const user = await User.find(id)
        return user
    }

    // Get user by email
    public async getUserByEmail(email: string) {
        const user = await User.findBy('email', email)
        return user
    }

    // Create user
    public async createUser(data: any) {
        const user = await User.create(data)
        return user
    }
}