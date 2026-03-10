import { CreatePaymentIntentDTO, ConfirmPaymentDTO } from "../dtos/payment.dto";
import { PaymentRepository } from "../repositories/payment.repository";
import { HttpError } from "../errors/http-error";
import { v4 as uuidv4 } from "uuid";

const paymentRepo = new PaymentRepository();

export class PaymentService {
    async createIntent(data: CreatePaymentIntentDTO) {
        const providerReference = `DUMMY-${uuidv4()}`;
        return paymentRepo.createPayment({
            ...data,
            status: "pending",
            provider: "dummy",
            providerReference,
        });
    }

    async confirmPayment(payload: ConfirmPaymentDTO) {
        const payment = await paymentRepo.getPaymentById(payload.paymentId);
        if (!payment) throw new HttpError(404, "Payment not found");

        const status = payload.success ? "paid" : "failed";
        const updated = await paymentRepo.updatePayment(payload.paymentId, { status });
        if (!updated) throw new HttpError(404, "Payment not found");
        return updated;
    }

    async getPaymentById(id: string) {
        const payment = await paymentRepo.getPaymentById(id);
        if (!payment) throw new HttpError(404, "Payment not found");
        return payment;
    }

    async listByPatient(patientId: string, params: { page: number; limit: number }) {
        return paymentRepo.getPaymentsByPatient(patientId, params);
    }

    async listByDoctor(doctorId: string, params: { page: number; limit: number }) {
        return paymentRepo.getPaymentsByDoctor(doctorId, params);
    }

    async listAll(params: { page: number; limit: number }) {
        return paymentRepo.getAllPayments(params);
    }

    async refund(paymentId: string) {
        const payment = await paymentRepo.getPaymentById(paymentId);
        if (!payment) throw new HttpError(404, "Payment not found");
        if (payment.status !== "paid") {
            throw new HttpError(400, "Only paid payments can be refunded");
        }

        const updated = await paymentRepo.updatePayment(paymentId, { status: "refunded" });
        if (!updated) throw new HttpError(404, "Payment not found");
        return updated;
    }

    async handleWebhook(providerReference?: string, status?: "paid" | "failed") {
        if (!providerReference) {
            throw new HttpError(400, "providerReference is required");
        }

        const payment = await paymentRepo.findByProviderReference(providerReference);
        if (!payment) throw new HttpError(404, "Payment not found");

        const updated = await paymentRepo.updatePayment(String(payment._id), {
            status: status ?? payment.status,
        });
        if (!updated) throw new HttpError(404, "Payment not found");
        return updated;
    }

    async getStats() {
        return paymentRepo.getStats();
    }

    async getDoctorRevenue(doctorId: string, period: string = "monthly") {
        // Get all paid payments for the doctor
        const { data: payments } = await paymentRepo.getPaymentsByDoctor(doctorId, { page: 1, limit: 10000 });
        
        if (!payments || payments.length === 0) {
            return {
                totalRevenue: 0,
                periodRevenue: 0,
                paymentCount: 0,
                period,
                payments: [],
                breakdown: {},
            };
        }

        // Filter for paid payments
        const paidPayments = payments.filter((p: any) => p.status === "paid");
        
        // Calculate revenue based on period
        const now = new Date();
        let periodStart: Date;

        switch (period.toLowerCase()) {
            case "daily":
                periodStart = new Date(now);
                periodStart.setHours(0, 0, 0, 0);
                break;
            case "weekly":
                periodStart = new Date(now);
                periodStart.setDate(now.getDate() - now.getDay());
                periodStart.setHours(0, 0, 0, 0);
                break;
            case "monthly":
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case "quarterly":
                periodStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case "yearly":
                periodStart = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        let totalRevenue = 0;
        let periodRevenue = 0;

        const breakdown: { [key: string]: number } = {};

        paidPayments.forEach((payment: any) => {
            const amount = payment.amount || 0;
            totalRevenue += amount;

            if (payment.createdAt) {
                const paymentDate = new Date(payment.createdAt);
                if (paymentDate >= periodStart) {
                    periodRevenue += amount;
                }

                // Breakdown by month or week
                const key = paymentDate.toISOString().split("T")[0];
                breakdown[key] = (breakdown[key] || 0) + amount;
            }
        });

        return {
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            periodRevenue: Math.round(periodRevenue * 100) / 100,
            paymentCount: paidPayments.length,
            period,
            payments: paidPayments.slice(0, 10), // Return last 10 payments
            breakdown,
        };
    }}