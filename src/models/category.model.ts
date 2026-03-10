import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    isActive: boolean;
    created_at: Date;
    updated_at: Date;
}

const CategorySchema: Schema<ICategory> = new Schema<ICategory>(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String, default: "" },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    }
);

CategorySchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.isActive !== undefined) ret.is_active = ret.isActive;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.isActive;
        return ret;
    },
});

export const CategoryModel = mongoose.model<ICategory>("Category", CategorySchema);
