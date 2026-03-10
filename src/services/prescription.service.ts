import fs from "fs";
import path from "path";
import { CreatePrescriptionDTO, UpdatePrescriptionDTO, UpdatePrescriptionItemsDTO } from "../dtos/prescription.dto";
import { PrescriptionRepository } from "../repositories/prescription.repository";
import { PrescriptionItemRepository } from "../repositories/prescription-item.repository";
import { HttpError } from "../errors/http-error";
import { generatePrescriptionPdf } from "../utils/pdf";

const prescriptionRepo = new PrescriptionRepository();
const itemRepo = new PrescriptionItemRepository();

export class PrescriptionService {
    async createPrescription(data: CreatePrescriptionDTO) {
        const { items, ...payload } = data;
        const prescription = await prescriptionRepo.createPrescription(payload);
        const itemPayloads = items.map((item) => ({
            ...item,
            prescriptionId: prescription._id,
        }));
        await itemRepo.createItems(itemPayloads as any);
        return this.getPrescriptionById(String(prescription._id));
    }

    async getPrescriptionById(id: string) {
        const prescription = await prescriptionRepo.getPrescriptionById(id);
        if (!prescription) throw new HttpError(404, "Prescription not found");
        const items = await itemRepo.getItemsByPrescription(id);
        return { prescription, items };
    }

    async getPrescriptionPdf(id: string) {
        const { prescription, items } = await this.getPrescriptionById(id);
        if (prescription.pdfFilename) {
            const filePath = path.join(process.cwd(), "uploads", "prescriptions", prescription.pdfFilename);
            if (fs.existsSync(filePath)) {
                return { filePath, filename: prescription.pdfFilename };
            }
        }

        const pdfResult = await generatePrescriptionPdf({
            prescription: {
                _id: String(prescription._id),
                patientId: String(prescription.patientId),
                doctorId: String(prescription.doctorId),
                notes: prescription.notes,
                status: prescription.status,
                created_at: prescription.created_at,
            },
            items: items.map((item) => ({
                name: item.name,
                dosage: item.dosage,
                frequency: item.frequency,
                duration: item.duration,
                instructions: item.instructions,
            })),
        });

        await prescriptionRepo.updatePrescription(id, {
            pdfUrl: pdfResult.fileUrl,
            pdfFilename: pdfResult.filename,
        } as any);

        return { filePath: pdfResult.filePath, filename: pdfResult.filename };
    }

    async listByDoctor(doctorId: string, params: { page: number; limit: number }) {
        const result = await prescriptionRepo.getPrescriptionsByDoctor(doctorId, params);
        return result;
    }

    async listByPatient(patientId: string, params: { page: number; limit: number }) {
        const result = await prescriptionRepo.getPrescriptionsByPatient(patientId, params);
        return result;
    }

    async updatePrescription(id: string, data: UpdatePrescriptionDTO) {
        const prescription = await prescriptionRepo.updatePrescription(id, data);
        if (!prescription) throw new HttpError(404, "Prescription not found");
        return this.getPrescriptionById(id);
    }

    async updatePrescriptionItems(id: string, payload: UpdatePrescriptionItemsDTO) {
        await itemRepo.deleteByPrescription(id);
        await itemRepo.createItems(payload.items.map((item) => ({ ...item, prescriptionId: id })) as any);
        return this.getPrescriptionById(id);
    }

    async deletePrescription(id: string) {
        const prescription = await prescriptionRepo.getPrescriptionById(id);
        if (!prescription) throw new HttpError(404, "Prescription not found");
        await itemRepo.deleteByPrescription(id);
        await prescriptionRepo.deletePrescription(id);
        return true;
    }
}
