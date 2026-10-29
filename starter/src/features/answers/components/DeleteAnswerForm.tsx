"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteAnswerAction } from "../actions";

// Egen knapp, fordi useFormStatus bare virker i en komponent inni skjemaet.
function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button" disabled={pending}>
      {pending ? "Sletter …" : "Slett svar"}
    </button>
  );
}

// Slett-knapp for admin. Går det bra, tegnes siden på nytt uten svaret, og
// skjemaet for å svare kommer tilbake. Går det galt, viser vi feilmeldingen.
export function DeleteAnswerForm({ questionId }: { questionId: string }) {
  const [error, setError] = useState<string | null>(null);

  async function remove(formData: FormData) {
    setError(null);

    const result = await deleteAnswerAction(formData);

    if (!result.ok) setError(result.error.message);
  }

  return (
    <form
      action={remove}
      onSubmit={(event) => {
        // Sletting kan ikke angres, så vi spør først.
        if (!confirm("Vil du slette svaret?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="questionId" value={questionId} />
      <DeleteButton />
      {error && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}
    </form>
  );
}
