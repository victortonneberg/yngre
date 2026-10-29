import { requestInfo } from "rwsdk/worker";
import { isAdmin } from "../auth-types";

export function ProfilePage() {
  const { user } = requestInfo.ctx;

  if (!user) {
    // Skjer ikke da vi har requreUserPage
    return (
      <main>
        <h1>Profil</h1>

        <p>
          Du må være innlogget for å se profilen din. Logg inn ved å gå til{" "}
          <a href="/login">/login</a>.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>Profil</h1>

      <dl className="details">
        <dt>Navn</dt>
        <dd>{user.name}</dd>

        <dt>E-post</dt>
        <dd>{user.email}</dd>

        <dt>Rolle</dt>
        <dd>{user.role}</dd>
      </dl>

      <p>
        {isAdmin(user)
          ? "Som admin kan du svare på spørsmål."
          : "Du kan stille spørsmål og redigere dine egne."}
      </p>
    </main>
  );
}
