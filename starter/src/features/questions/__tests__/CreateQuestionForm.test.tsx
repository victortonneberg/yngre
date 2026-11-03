// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateQuestionForm } from "../components/CreateQuestionForm";

// Server-actionen kjører på serveren og kan ikke brukes i testen. Vi bytter den
// ut med en som svarer at tittelen mangler, og ser at skjemaet viser det.
vi.mock("../actions", () => ({
  createQuestionAction: vi.fn(async () => ({
    ok: false,
    error: {
      code: "400",
      message: "Ikke gyldig data",
      fieldErrors: { title: ["Tittel kan ikke være tom"] },
    },
    values: { title: "", content: "Teksten min" },
  })),
}));

describe("CreateQuestionForm", () => {
  it("viser feilmeldingen og beholder teksten brukeren skrev", async () => {
    const user = userEvent.setup();
    render(<CreateQuestionForm />);

    await user.type(screen.getByLabelText("Spørsmål"), "Teksten min");
    await user.click(screen.getByRole("button", { name: "Send spørsmål" }));

    expect(await screen.findByText("Tittel kan ikke være tom")).toBeVisible();
    expect(screen.getByLabelText("Spørsmål")).toHaveValue("Teksten min");
  });
});
