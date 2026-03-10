import nodemailer from "nodemailer";
import { EMAIL_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from "../configs";
import { EmailLogRepository } from "../repositories/email-log.repository";

const emailLogRepo = new EmailLogRepository();

type EmailPayload = {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    template?: string;
};

function hasSmtpConfig() {
    return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

function createTransport() {
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

export class EmailService {
    async sendEmail(payload: EmailPayload) {
        if (!hasSmtpConfig()) {
            await emailLogRepo.createLog({
                to: payload.to,
                subject: payload.subject,
                template: payload.template ?? "",
                status: "failed",
                error: "SMTP configuration missing",
            });
            return false;
        }

        const transporter = createTransport();
        try {
            await transporter.sendMail({
                from: EMAIL_FROM,
                to: payload.to,
                subject: payload.subject,
                text: payload.text,
                html: payload.html,
            });
            await emailLogRepo.createLog({
                to: payload.to,
                subject: payload.subject,
                template: payload.template ?? "",
                status: "sent",
                error: "",
            });
            return true;
        } catch (error: any) {
            await emailLogRepo.createLog({
                to: payload.to,
                subject: payload.subject,
                template: payload.template ?? "",
                status: "failed",
                error: error?.message ?? "Send failed",
            });
            return false;
        }
    }
}
