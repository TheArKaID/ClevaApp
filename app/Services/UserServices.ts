/* eslint-disable prettier/prettier */
import User from "App/Models/User"
import { base64 } from "@poppinss/utils/build/helpers";
import ApiToken from "App/Models/ApiToken";

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

    public async refreshToken(token:string) {
        let parsedToken = await this.parseToken(token)
        
        const oldToken = await ApiToken.query().preload('user').where('id', parsedToken.tokenId).first()

        if (!oldToken) {
            throw new Error('Invalid token')
        }

        return oldToken.user
    }
    
    private async parseToken(token:string) {
        const parts = token.replace('Bearer ', '').split('.');
        
        const tokenId = base64.urlDecode(parts[0], 'utf8', true);
        if (!tokenId) {
            throw new Error('Invalid token');
        }
        const parsedToken = {
            tokenId,
            value: parts[1],
        };
        return parsedToken;
    }
}