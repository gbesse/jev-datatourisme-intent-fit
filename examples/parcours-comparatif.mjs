// Objectif : produire un rapport hors ligne comparant les trois chemins de décision.
import assert from "node:assert/strict";
import { assessTourismFit } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const principal = {
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
const limite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-10-01"
  },
  "places": []
};
const revue = {
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
const réponses = [{
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
}, {
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
}];
const provider = createFakeProvider(() => réponses.shift());
const résultats = [];
for (const [scénario, dossier] of [["principal", principal], ["limite déterministe", limite], ["revue humaine", revue]]) {
  const résultat = await assessTourismFit(dossier, provider);
  résultats.push({ scénario, décision: résultat.label, revueHumaine: résultat.review, déterministe: résultat.deterministic });
}
assert.deepEqual(résultats.map((r) => [r.décision, r.revueHumaine, r.déterministe]), [
  ["forte_adequation", false, false],
  ["aucun_lieu_fourni", false, true],
  ["revue_requise", true, false],
]);
assert.equal(provider.calls, 2);
console.log(JSON.stringify({ dépôt: "jev-datatourisme-intent-fit", résultats }, null, 2));
