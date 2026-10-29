"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteQuestionAction } from "../actions";

// Egen knapp, fordi useFormStatus bare virker i en komponent inni skjemaet.
function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="button" disabled={pending}>
      {pending ? "Sletter …" : "Slett spørsmål"}
    </button>
  );
}

// Slett-knapp med en skjult id. Går det bra, omdirigerer serveren til forsiden.
// Går det galt, viser vi feilmeldingen.
export function DeleteQuestionForm({ questionId }: { questionId: string }) {
  const [error, setError] = useState<string | null>(null);

  async function remove(formData: FormData) {
    setError(null);

    const result = await deleteQuestionAction(formData);

    // En omdirigering er en Response og håndteres av rwsdk. Alt annet er en feil.
    if (result && "error" in result) setError(result.error.message);
  }

  return (
    <form
      action={remove}
      onSubmit={(event) => {
        // Sletting kan ikke angres, så vi spør først.
        if (!confirm("Vil du slette spørsmålet?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={questionId} />
      <DeleteButton />
      {error && (
        <p role="alert" className="alert">
          {error}
        </p>
      )}
    </form>
  );
}
