// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";
export const DECISIONS = Object.freeze({
  "strong_fit": "forte_adequation",
  "review_required": "revue_requise",
  "weak_fit": "adequation_faible",
  "no_place": "aucun_lieu_fourni"
});
const CRITERIA = Object.freeze({
  "strong_fit": "forte adequation",
  "review_required": "revue requise",
  "weak_fit": "adequation faible",
  "no_place": "aucun lieu fourni"
});
export function tourismIntentCase(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}
export async function assessTourismFit(input, provider) {
  const record = tourismIntentCase(input);
  if (Array.isArray(record.places) && record.places.length === 0) return { decision: "no_place", label: DECISIONS["no_place"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce dossier à partir des seuls éléments sourcés. Évaluez les envies, contraintes de public, services et descriptions effectivement présents dans les fiches candidates. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni règle applicable, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-datatourisme-intent-fit <dossier.json>");
  const dossier = tourismIntentCase(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier, prochaineÉtape: "Transmettez ce dossier à assessTourismFit avec un fournisseur Jev configuré." }, null, 2));
}
