// Objectif : vérifier les types publiés depuis un projet consommateur.
import { tourismIntentCase, assessTourismFit, DECISIONS } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = tourismIntentCase({
  "id": "exemple-1",
  "text": "Demande synthétique : sortie calme avec deux enfants, accessible en poussette et ouverte le dimanche ; la fiche candidate documente ces trois caractéristiques.",
  "source": {
    "url": "https://example.test/source-publique",
    "date": "2026-10-01"
  },
  "details": {
    "territoire": "France — cas synthétique",
    "origine": "donnée synthétique"
  }
});
void DECISIONS;
void assessTourismFit(dossier, createFakeProvider(() => ({})));
