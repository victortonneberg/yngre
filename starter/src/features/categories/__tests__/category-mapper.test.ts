import { describe, expect, it } from "vitest";
import { toCategoryDTO } from "../category-mapper";

describe("toCategoryDTO", () => {
  it("gir id og navn", () => {
    expect(toCategoryDTO({ id: "abc", name: "Studier" })).toEqual({
      id: "abc",
      name: "Studier",
    });
  });
});
