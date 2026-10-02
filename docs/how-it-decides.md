# Comment la décision est prise

Rapproche une intention de sortie de lieux touristiques documentés et justifie les propositions en français.

Le code normalise la source et applique d’abord le cas déterministe documenté dans `src/index.mjs`. Pour les autres dossiers, Jev choisit la catégorie la plus prudente selon les envies, contraintes de public, services et descriptions effectivement présents dans les fiches candidates. Une confiance inférieure à `0.8` marque le résultat pour revue humaine.

Les distances, dates, horaires et disponibilités explicites restent filtrés par le code.

Les démonstrations ne contiennent que des probabilités synthétiques. Constituez un corpus français annoté, mesurez les erreurs par catégorie et fixez vos propres seuils avant un usage opérationnel.
