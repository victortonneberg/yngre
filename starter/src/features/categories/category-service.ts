// Reglene for categories.
// Kategoriene er forhåndsbestemte (fra seed), så vi bare leser dem.

import type { Result } from "@/lib/shared/result";
import { type CategoryDTO, toCategoryDTO } from "./category-mapper";
import { type CategoryRepository, repository } from "./category-repository";

export interface CategoryService {
  list(): Promise<Result<CategoryDTO[]>>;
  findById(id: string): Promise<Result<CategoryDTO>>;
}

export function createCategoryService(
  _repository: CategoryRepository,
): CategoryService {
  return {
    async list() {
      const result = await _repository.findMany();
      if (!result.ok) return result;

      return { ok: true, data: result.data.map(toCategoryDTO) };
    },
    async findById(id) {
      const result = await _repository.findById(id);
      if (!result.ok) return result;

      // Repository gir null når raden ikke finnes. Det er en 404 her.
      if (!result.data) {
        return {
          ok: false,
          error: {
            code: "404",
            message: "Kategori finnes ikke",
            fieldErrors: {},
          },
        };
      }

      return { ok: true, data: toCategoryDTO(result.data) };
    },
  };
}

export const service = createCategoryService(repository);
