import z from "zod";
import { ReviewSchema } from "../types/review.type";

export const CreateReviewDTO = ReviewSchema;
export type CreateReviewDTO = z.infer<typeof CreateReviewDTO>;

export const UpdateReviewDTO = z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().optional(),
});
export type UpdateReviewDTO = z.infer<typeof UpdateReviewDTO>;
