import mongoose, { Schema, Document } from "mongoose";

export interface IFaq extends Document {
    _id: mongoose.Types.ObjectId;
    question: string;
    answer: string;
    category: string;
    tags: string[];
    isActive: boolean;
    displayOrder: number;
    created_at: Date;
    updated_at: Date;
}

const FaqSchema: Schema<IFaq> = new Schema<IFaq>(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        category: { type: String, default: "" },
        tags: [{ type: String }],
        isActive: { type: Boolean, default: true },
        displayOrder: { type: Number, default: 0 },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

FaqSchema.index({ isActive: 1, displayOrder: 1 });

FaqSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.isActive !== undefined) ret.is_active = ret.isActive;
        if (ret.displayOrder !== undefined) ret.display_order = ret.displayOrder;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.isActive;
        delete ret.displayOrder;
        return ret;
    },
});

export const FaqModel = mongoose.model<IFaq>("Faq", FaqSchema);
