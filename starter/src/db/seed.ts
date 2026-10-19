// Testdata. Kjør med:
//   npm run seed      (eller pnpm seed)
//
// Poenget med en seed er at databasen kan nullstilles til en kjent tilstand.
// Slett .wrangler/, kjør migrasjonene og denne, så er dere tilbake der dere
// startet. Da slipper dere å lure på om feilen ligger i dataene.
import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";
import { users, questions, answers } from "./schema";

export const seedData = async (env: Env) => {
  const db = drizzle(env.DB);

  // Tøm først, så seed kan kjøres om igjen uten å doble alt. Barn før foreldre.
  await db.delete(answers);
  await db.delete(questions);
  await db.delete(users);

  // Faste id-er for brukerne, så kode som peker på dem (f.eks. før innlogging
  // er på plass) alltid treffer riktig bruker, uansett hvor mange ganger vi seeder.
  // Foreldrene må inn før barna: fremmednøkkelen krever at raden finnes.
  // Databasen nekter hvis dere tar rekkefølgen feil, og det er en god ting.
  const [user, admin] = await db
    .insert(users)
    .values([
      {
        id: 1,
        name: "Test Testesen",
        email: "test@example.com",
        role: "user",
      },
      {
        id: 2,
        name: "Admin Adminsen",
        email: "admin@example.com",
        role: "admin",
      },
    ])
    .returning();

  const [question] = await db
    .insert(questions)
    .values({
      title: "Hvordan søker jeg om studielån?",
      content: "Hvor og når må jeg søke for å få lån til høsten?",
      userId: user.id,
    })
    .returning();

  await db.insert(answers).values({
    questionId: question.id,
    adminId: admin.id,
    content: "Du søker i Lånekassen innen 15. november.",
  });

  console.log("Seeding ferdig");
};

export default defineScript(async ({ env }) => {
  await seedData(env);
  return Response.json({ success: true });
});
