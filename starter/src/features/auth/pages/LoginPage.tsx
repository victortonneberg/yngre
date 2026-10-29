import { db } from "@/db";

export async function LoginPage() {
  // USIKKERT: viser alle brukerne til alle som besøker siden. Alternativ:
  // felt for e-post og passord, slik at ingen ser hvem som finnes.
  const users = await db.query.users.findMany({
    columns: { id: true, name: true, role: true },
    orderBy: { id: "asc" },
  });

  return (
    <main>
      <h1>Logg inn</h1>
      <p>Jukseinnlogging. Velg hvem du er, uten passord.</p>

      {users.length === 0 ? (
        <p role="alert" className="alert">
          Ingen brukere i databasen. Kjør <code>pnpm seed</code>.
        </p>
      ) : (
        <form method="post" action="/login" className="form">
          <label htmlFor="userId">Bruker</label>
          {/* `name` er nøkkelen i skjemadataene, `value` er verdien. */}
          <select id="userId" name="userId">
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {`${user.name} (${user.role})`}
              </option>
            ))}
          </select>

          <button type="submit" className="button">
            Logg inn
          </button>
        </form>
      )}
    </main>
  );
}
