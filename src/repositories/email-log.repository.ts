import { EmailLogModel, IEmailLog } from "../models/email-log.model";

export interface IEmailLogRepository {
    createLog(data: Partial<IEmailLog>): Promise<IEmailLog>;
}

export class EmailLogRepository implements IEmailLogRepository {
    async createLog(data: Partial<IEmailLog>): Promise<IEmailLog> {
        const log = new EmailLogModel(data);
        return log.save();
    }
}
