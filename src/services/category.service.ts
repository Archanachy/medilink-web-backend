import { CreateCategoryDTO, UpdateCategoryDTO } from "../dtos/category.dto";
import { CategoryRepository } from "../repositories/category.repository";
import { HttpError } from "../errors/http-error";

const categoryRepo = new CategoryRepository();

export class CategoryService {
    async createCategory(data: CreateCategoryDTO) {
        return categoryRepo.createCategory(data);
    }

    async getCategoryById(id: string) {
        const category = await categoryRepo.getCategoryById(id);
        if (!category) throw new HttpError(404, "Category not found");
        return category;
    }

    async listCategories(params: { page: number; limit: number }) {
        return categoryRepo.getCategories(params);
    }

    async updateCategory(id: string, data: UpdateCategoryDTO) {
        const category = await categoryRepo.updateCategory(id, data);
        if (!category) throw new HttpError(404, "Category not found");
        return category;
    }

    async deleteCategory(id: string) {
        const ok = await categoryRepo.deleteCategory(id);
        if (!ok) throw new HttpError(404, "Category not found");
        return ok;
    }
}
