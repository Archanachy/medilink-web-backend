import nodemailer from "nodemailer";
import { EMAIL_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } from "../configs";
import { HttpError } from "../errors/http-error";

type PasswordResetEmail = {
    to: string;
    name?: string;
    resetUrl: string;
};

function createTransport() {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        throw new HttpError(500, "SMTP configuration is missing");
    }

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

export async function sendPasswordResetEmail(payload: PasswordResetEmail) {
    const transporter = createTransport();
    const displayName = payload.name?.trim() || "there";

    await transporter.sendMail({
        from: EMAIL_FROM,
        to: payload.to,
        subject: "Reset your password",
        text: `Hi ${displayName},\n\nReset your password using this link:\n${payload.resetUrl}\n\nIf you did not request this, you can ignore this email.`,
        html: `<p>Hi ${displayName},</p><p>Reset your password using this link:</p><p><a href="${payload.resetUrl}">${payload.resetUrl}</a></p><p>If you did not request this, you can ignore this email.</p>`,
    });
}
