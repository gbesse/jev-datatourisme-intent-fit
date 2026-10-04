// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";
import { validateChoiceResponse } from "./jev.mjs";
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
  const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  if (!object(input) || !object(input.source)) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  for (const value of [input.id, input.text, input.source.url, input.source.date]) {
    if (typeof value !== "string" || !value.trim()) throw new TypeError("Le dossier exige des chaînes non vides pour id, text, source.url et source.date");
  }
  const rawDate = input.source.date.trim();
  const calendar = /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/.exec(rawDate);
  const date = new Date(rawDate);
  if (!calendar || Number.isNaN(date.valueOf()) || new Date(rawDate.slice(0, 10) + "T00:00:00.000Z").toISOString().slice(0, 10) !== rawDate.slice(0, 10)) throw new TypeError("source.date doit être une date ISO valide");
  let url;
  try { url = new URL(input.source.url.trim()); } catch { throw new TypeError("source.url doit être une URL HTTP(S) valide"); }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new TypeError("source.url doit être une URL HTTP(S) sans identifiants");
  if (input.places !== undefined && !Array.isArray(input.places)) throw new TypeError("places doit être un tableau lorsqu’il est fourni");
  return { ...input, id: input.id.trim(), text: input.text.trim(), source: { ...input.source, url: url.href, date: date.toISOString() } };
}
export async function assessTourismFit(input, provider) {
  const record = tourismIntentCase(input);
  if (Array.isArray(record.places) && record.places.length === 0) return { decision: "no_place", label: DECISIONS["no_place"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce dossier à partir des seuls éléments sourcés. Évaluez les envies, contraintes de public, services et descriptions effectivement présents dans les fiches candidates. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni règle applicable, ni garantie.", criteria: CRITERIA } },
  });
  const answer = validateChoiceResponse(response, { decision: { type: "choice", instructions: "Validation métier", criteria: CRITERIA } }).answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8 || answer.choice === "review_required" || answer.choice === "no_place", deterministic: false, usage: response.usage };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-datatourisme-intent-fit <dossier.json>");
  const dossier = tourismIntentCase(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier, prochaineÉtape: "Transmettez ce dossier à assessTourismFit avec un fournisseur Jev configuré." }, null, 2));
}
