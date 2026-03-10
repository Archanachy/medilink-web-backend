import { UserModel, IUser } from "../models/user.model";
export interface IUserRepository {
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(params: { page: number; limit: number }): Promise<{ data: IUser[]; total: number }>;
    getUserByResetToken(token: string): Promise<IUser | null>;
    updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUser(id: string): Promise<boolean>;
}
// MongoDb Implementation of UserRepository
export class UserRepository implements IUserRepository {
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(userData); 
        return await user.save();
    }
    async getUserByEmail(email: string): Promise<IUser | null> {
        // include password explicitly for internal use (authentication)
        const user = await UserModel.findOne({ "email": email }).select('+password')
        return user;
    }
    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "username": username })
        return user;
    }

    async getUserById(id: string): Promise<IUser | null> {
        // UserModel.findOne({ "_id": id });
        const user = await UserModel.findById(id);
        return user;
    }
    async getAllUsers(params: { page: number; limit: number }): Promise<{ data: IUser[]; total: number }> {
        const skip = (params.page - 1) * params.limit;
        const [data, total] = await Promise.all([
            UserModel.find().sort({ created_at: -1 }).skip(skip).limit(params.limit),
            UserModel.countDocuments(),
        ]);
        return { data, total };
    }

    async getUserByResetToken(token: string): Promise<IUser | null> {
        const user = await UserModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });
        return user;
    }
    async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        // UserModel.updateOne({ _id: id }, { $set: updateData });
        const updatedUser = await UserModel.findByIdAndUpdate(
            id, updateData, { new: true } // return the updated document
        );
        return updatedUser;
    }
    async deleteUser(id: string): Promise<boolean> {
        // UserModel.deleteOne({ _id: id });
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : false;
    }
}