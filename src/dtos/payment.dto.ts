import z from "zod";
import { PaymentSchema } from "../types/payment.type";

export const CreatePaymentIntentDTO = PaymentSchema.pick({
    patientId: true,
    doctorId: true,
    appointmentId: true,
    amount: true,
    currency: true,
});
export type CreatePaymentIntentDTO = z.infer<typeof CreatePaymentIntentDTO>;

export const ConfirmPaymentDTO = z.object({
    paymentId: z.string(),
    success: z.boolean(),
});
export type ConfirmPaymentDTO = z.infer<typeof ConfirmPaymentDTO>;

export const RefundPaymentDTO = z.object({
    reason: z.string().optional().default(""),
});
export type RefundPaymentDTO = z.infer<typeof RefundPaymentDTO>;

export const WebhookPaymentDTO = z.object({
    providerReference: z.string().optional(),
    status: z.enum(["paid", "failed"]).optional(),
});
export type WebhookPaymentDTO = z.infer<typeof WebhookPaymentDTO>;
