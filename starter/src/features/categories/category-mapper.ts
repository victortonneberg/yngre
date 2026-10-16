import type { Category } from "@/db/schema";

// Det klienten får se. Raden fra databasen forlater aldri servicen.
export type CategoryDTO = {
  id: string;
  name: string;
};

export function toCategoryDTO({ id, name }: Category): CategoryDTO {
  return { id, name };
}
