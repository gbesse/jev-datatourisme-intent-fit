// Objectif : vérifier la normalisation, la règle déterministe et les décisions sémantiques.
import test from "node:test";
import assert from "node:assert/strict";
import { tourismIntentCase, assessTourismFit } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const casLimite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-10-01"
  },
  "places": []
};
const casPrincipal = {
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
};
const casÀRevoir = {
  "id": "revue-1",
  "text": "La fiche évoque un lieu familial et accessible sans préciser les âges conseillés, l’accessibilité réelle ni les horaires de la date demandée.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-10-01"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
test("exige une source", () => assert.throws(() => tourismIntentCase({ id: "x", text: "y" }), /source/));
test("refuse une date de source invalide", () => assert.throws(() => tourismIntentCase({ id: "x", text: "y", source: { url: "https://example.test", date: "impossible" } }), /date ISO/));
test("applique le cas limite sans appel Jev", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  assert.equal((await assessTourismFit(casLimite, provider)).decision, "no_place");
  assert.equal(provider.calls, 0);
});
test("classe un dossier sourcé avec une confiance suffisante", async () => {
  const provider = createFakeProvider(() => ({
  "model": "jev-1.13.0",
  "answers": {
    "decision": {
      "type": "choice",
      "choice": "strong_fit",
      "probabilities": {
        "strong_fit": 0.82,
        "review_required": 0.06,
        "weak_fit": 0.06,
        "no_place": 0.06
      },
      "confidence": 0.82
    }
  },
  "usage": {
    "input_tokens": 120,
    "output_tokens": 0
  }
}));
  const résultat = await assessTourismFit(casPrincipal, provider);
  assert.equal(résultat.decision, "strong_fit");
  assert.equal(résultat.review, false);
  assert.equal(provider.calls, 1);
});
test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({
  "model": "jev-1.13.0",
  "answers": {
    "decision": {
      "type": "choice",
      "choice": "review_required",
      "probabilities": {
        "strong_fit": 0.1267,
        "review_required": 0.62,
        "weak_fit": 0.1267,
        "no_place": 0.1267
      },
      "confidence": 0.62
    }
  },
  "usage": {
    "input_tokens": 140,
    "output_tokens": 0
  }
}));
  const résultat = await assessTourismFit(casÀRevoir, provider);
  assert.equal(résultat.decision, "review_required");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
});
