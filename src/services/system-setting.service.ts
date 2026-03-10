import { SystemSettingRepository } from "../repositories/system-setting.repository";
import { HttpError } from "../errors/http-error";

const settingRepo = new SystemSettingRepository();

export class SystemSettingService {
    async list(params: { page: number; limit: number }) {
        return settingRepo.list(params);
    }

    async getByKey(key: string) {
        const setting = await settingRepo.getByKey(key);
        if (!setting) throw new HttpError(404, "Setting not found");
        return setting;
    }

    async updateByKey(key: string, payload: { value?: any; category?: string; description?: string; isActive?: boolean; updatedBy?: string }) {
        const existing = await settingRepo.getByKey(key);
        if (!existing) {
            return settingRepo.create({ key, ...payload } as any);
        }

        const updated = await settingRepo.updateByKey(key, payload as any);
        if (!updated) throw new HttpError(404, "Setting not found");
        return updated;
    }
}
