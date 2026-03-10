import { SmsLogModel, ISmsLog } from "../models/sms-log.model";

export interface ISmsLogRepository {
    createLog(data: Partial<ISmsLog>): Promise<ISmsLog>;
}

export class SmsLogRepository implements ISmsLogRepository {
    async createLog(data: Partial<ISmsLog>): Promise<ISmsLog> {
        const log = new SmsLogModel(data);
        return log.save();
    }
}
