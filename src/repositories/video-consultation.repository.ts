import { VideoConsultationModel, IVideoConsultation } from "../models/video-consultation.model";

export interface IVideoConsultationRepository {
    create(data: Partial<IVideoConsultation>): Promise<IVideoConsultation>;
    getById(id: string): Promise<IVideoConsultation | null>;
    getByAppointmentId(appointmentId: string): Promise<IVideoConsultation | null>;
    update(id: string, data: Partial<IVideoConsultation>): Promise<IVideoConsultation | null>;
}

export class VideoConsultationRepository implements IVideoConsultationRepository {
    async create(data: Partial<IVideoConsultation>): Promise<IVideoConsultation> {
        const record = new VideoConsultationModel(data);
        return record.save();
    }

    async getById(id: string): Promise<IVideoConsultation | null> {
        return VideoConsultationModel.findById(id);
    }

    async getByAppointmentId(appointmentId: string): Promise<IVideoConsultation | null> {
        return VideoConsultationModel.findOne({ appointmentId });
    }

    async update(id: string, data: Partial<IVideoConsultation>): Promise<IVideoConsultation | null> {
        return VideoConsultationModel.findByIdAndUpdate(id, data, { new: true });
    }
}
