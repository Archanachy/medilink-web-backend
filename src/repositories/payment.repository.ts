import { PaymentModel, IPayment } from "../models/payment.model";

export interface IPaymentRepository {
    createPayment(data: Partial<IPayment>): Promise<IPayment>;
    getPaymentById(id: string): Promise<IPayment | null>;
    getPaymentsByPatient(patientId: string, params?: { page: number; limit: number }): Promise<{ data: IPayment[]; total: number }>;
    getPaymentsByDoctor(doctorId: string, params?: { page: number; limit: number }): Promise<{ data: IPayment[]; total: number }>;
    getAllPayments(params?: { page: number; limit: number }): Promise<{ data: IPayment[]; total: number }>;
    updatePayment(id: string, data: Partial<IPayment>): Promise<IPayment | null>;
    findByProviderReference(providerReference: string): Promise<IPayment | null>;
    getStats(): Promise<{ total: number; paid: number; refunded: number; failed: number; amountPaid: number }>;
}

export class PaymentRepository implements IPaymentRepository {
    async createPayment(data: Partial<IPayment>): Promise<IPayment> {
        const payment = new PaymentModel(data);
        return payment.save();
    }

    async getPaymentById(id: string): Promise<IPayment | null> {
        return PaymentModel.findById(id);
    }

    async getPaymentsByPatient(
        patientId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IPayment[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            PaymentModel.find({ patientId }).sort({ created_at: -1 }).skip(skip).limit(limit),
            PaymentModel.countDocuments({ patientId }),
        ]);
        return { data, total };
    }

    async getPaymentsByDoctor(
        doctorId: string,
        params?: { page: number; limit: number }
    ): Promise<{ data: IPayment[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 10;
        const [data, total] = await Promise.all([
            PaymentModel.find({ doctorId }).sort({ created_at: -1 }).skip(skip).limit(limit),
            PaymentModel.countDocuments({ doctorId }),
        ]);
        return { data, total };
    }

    async getAllPayments(params?: { page: number; limit: number }): Promise<{ data: IPayment[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 25;
        const [data, total] = await Promise.all([
            PaymentModel.find().sort({ created_at: -1 }).skip(skip).limit(limit),
            PaymentModel.countDocuments(),
        ]);
        return { data, total };
    }

    async updatePayment(id: string, data: Partial<IPayment>): Promise<IPayment | null> {
        return PaymentModel.findByIdAndUpdate(id, data, { new: true });
    }

    async findByProviderReference(providerReference: string): Promise<IPayment | null> {
        return PaymentModel.findOne({ providerReference });
    }

    async getStats(): Promise<{ total: number; paid: number; refunded: number; failed: number; amountPaid: number }> {
        const [total, paid, refunded, failed, amountPaidResult] = await Promise.all([
            PaymentModel.countDocuments(),
            PaymentModel.countDocuments({ status: "paid" }),
            PaymentModel.countDocuments({ status: "refunded" }),
            PaymentModel.countDocuments({ status: "failed" }),
            PaymentModel.aggregate([
                { $match: { status: "paid" } },
                { $group: { _id: null, amountPaid: { $sum: "$amount" } } },
            ]),
        ]);

        const amountPaid = amountPaidResult?.[0]?.amountPaid ?? 0;
        return { total, paid, refunded, failed, amountPaid };
    }
}
