import z from "zod";

// Hva admin får sende inn: bare selve svaret. Brukes både når et svar lages og
// når det endres, siden content er det eneste feltet. questionId kommer fra URL-en og
// adminId fra innloggingen, så ingen av dem kan klienten bestemme selv.
// Lengde og andre regler: utils/validate-answer.ts.
export const createAnswerSchema = z.object({
  content: z.string("Svaret må være tekst").trim(),
});
