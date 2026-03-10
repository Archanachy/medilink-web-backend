import { CategoryModel, ICategory } from "../models/category.model";

export interface ICategoryRepository {
    createCategory(data: Partial<ICategory>): Promise<ICategory>;
    getCategoryById(id: string): Promise<ICategory | null>;
    getCategories(params?: { page: number; limit: number }): Promise<{ data: ICategory[]; total: number }>;
    updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null>;
    deleteCategory(id: string): Promise<boolean>;
}

export class CategoryRepository implements ICategoryRepository {
    async createCategory(data: Partial<ICategory>): Promise<ICategory> {
        const category = new CategoryModel(data);
        return category.save();
    }

    async getCategoryById(id: string): Promise<ICategory | null> {
        return CategoryModel.findById(id);
    }

    async getCategories(params?: { page: number; limit: number }): Promise<{ data: ICategory[]; total: number }> {
        const skip = params ? (params.page - 1) * params.limit : 0;
        const limit = params ? params.limit : 25;
        const [data, total] = await Promise.all([
            CategoryModel.find().sort({ created_at: -1 }).skip(skip).limit(limit),
            CategoryModel.countDocuments(),
        ]);
        return { data, total };
    }

    async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
        return CategoryModel.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteCategory(id: string): Promise<boolean> {
        const result = await CategoryModel.findByIdAndDelete(id);
        return !!result;
    }
}
