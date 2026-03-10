import { SystemSettingModel, ISystemSetting } from "../models/system-setting.model";

export interface ISystemSettingRepository {
    create(data: Partial<ISystemSetting>): Promise<ISystemSetting>;
    getByKey(key: string): Promise<ISystemSetting | null>;
    list(params?: { page: number; limit: number }): Promise<{ data: ISystemSetting[]; total: number }>;
    updateByKey(key: string, data: Partial<ISystemSetting>): Promise<ISystemSetting | null>;
}

export class SystemSettingRepository implements ISystemSettingRepository {
    async create(data: Partial<ISystemSetting>): Promise<ISystemSetting> {
        const setting = new SystemSettingModel(data);
        return setting.save();
    }

    async getByKey(key: string): Promise<ISystemSetting | null> {
        return SystemSettingModel.findOne({ key });
    }

    async list(params?: { page: number; limit: number }): Promise<{ data: ISystemSetting[]; total: number }> {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 25;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            SystemSettingModel.find().sort({ created_at: -1 }).skip(skip).limit(limit),
            SystemSettingModel.countDocuments(),
        ]);
        return { data, total };
    }

    async updateByKey(key: string, data: Partial<ISystemSetting>): Promise<ISystemSetting | null> {
        return SystemSettingModel.findOneAndUpdate({ key }, data, { new: true, upsert: false });
    }
}
