import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    imageUrl: string;
    linkUrl: string;
    startDate?: Date;
    endDate?: Date;
    targetRoles: string[];
    isActive: boolean;
    displayOrder: number;
    viewCount: number;
    clickCount: number;
    created_at: Date;
    updated_at: Date;
}

const BannerSchema: Schema<IBanner> = new Schema<IBanner>(
    {
        title: { type: String, required: true },
        imageUrl: { type: String, required: true },
        linkUrl: { type: String, default: "" },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        targetRoles: [{ type: String }],
        isActive: { type: Boolean, default: true },
        displayOrder: { type: Number, default: 0 },
        viewCount: { type: Number, default: 0 },
        clickCount: { type: Number, default: 0 },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

BannerSchema.index({ isActive: 1, displayOrder: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });

BannerSchema.set("toJSON", {
    transform: (_: any, ret: any) => {
        delete ret.__v;
        if (ret.created_at === undefined && ret.createdAt) ret.created_at = ret.createdAt;
        if (ret.updated_at === undefined && ret.updatedAt) ret.updated_at = ret.updatedAt;
        if (ret.isActive !== undefined) ret.is_active = ret.isActive;
        if (ret.displayOrder !== undefined) ret.display_order = ret.displayOrder;
        if (ret.imageUrl !== undefined) ret.image_url = ret.imageUrl;
        if (ret.linkUrl !== undefined) ret.link_url = ret.linkUrl;
        if (ret.startDate) ret.start_date = ret.startDate;
        if (ret.endDate) ret.end_date = ret.endDate;
        if (ret.viewCount !== undefined) ret.view_count = ret.viewCount;
        if (ret.clickCount !== undefined) ret.click_count = ret.clickCount;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.isActive;
        delete ret.displayOrder;
        delete ret.imageUrl;
        delete ret.linkUrl;
        delete ret.startDate;
        delete ret.endDate;
        delete ret.viewCount;
        delete ret.clickCount;
        return ret;
    },
});

export const BannerModel = mongoose.model<IBanner>("Banner", BannerSchema);
