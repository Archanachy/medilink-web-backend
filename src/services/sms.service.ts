import { SmsLogRepository } from "../repositories/sms-log.repository";

const smsLogRepo = new SmsLogRepository();

type SmsPayload = {
    to: string;
    message: string;
    template?: string;
};

export class SmsService {
    async sendSms(payload: SmsPayload) {
        await smsLogRepo.createLog({
            to: payload.to,
            message: payload.message,
            status: "sent",
            error: "",
        });
        return true;
    }
}
