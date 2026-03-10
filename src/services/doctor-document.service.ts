import { CreateDoctorDocumentDTO, UpdateDoctorDocumentStatusDTO } from "../dtos/doctor-document.dto";
import { DoctorDocumentRepository } from "../repositories/doctor-document.repository";
import { DoctorRepository } from "../repositories/doctor.repository";
import { HttpError } from "../errors/http-error";
import { NotificationService } from "./notification.service";

const documentRepo = new DoctorDocumentRepository();
const doctorRepo = new DoctorRepository();
const notificationService = new NotificationService();

export class DoctorDocumentService {
    async createDocument(data: CreateDoctorDocumentDTO) {
        return documentRepo.createDocument(data);
    }

    async listByDoctor(doctorId: string, params: { page: number; limit: number }) {
        return documentRepo.getDocumentsByDoctor(doctorId, params);
    }

    async getById(id: string) {
        const doc = await documentRepo.getDocumentById(id);
        if (!doc) throw new HttpError(404, "Document not found");
        return doc;
    }

    async updateStatus(id: string, payload: UpdateDoctorDocumentStatusDTO) {
        const doc = await documentRepo.updateDocument(id, payload);
        if (!doc) throw new HttpError(404, "Document not found");

        const doctor = await doctorRepo.getDoctorById(String(doc.doctorId));

        if (payload.status === "approved") {
            await doctorRepo.updateDoctor(String(doc.doctorId), { verificationStatus: "verified" } as any);
        }
        if (payload.status === "rejected") {
            await doctorRepo.updateDoctor(String(doc.doctorId), { verificationStatus: "rejected" } as any);
        }

        if (doctor) {
            await notificationService.createNotification({
                userId: String(doctor._id),
                role: "doctor",
                title: "Verification update",
                message: `Your document was ${payload.status}.`,
                type: "verification",
                data: { documentId: String(doc._id) },
                isRead: false,
            });
        }

        return doc;
    }

    async deleteDocument(id: string) {
        const ok = await documentRepo.deleteDocument(id);
        if (!ok) throw new HttpError(404, "Document not found");
        return ok;
    }
}
