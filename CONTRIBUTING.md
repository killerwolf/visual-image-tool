# Guide du mainteneur du package

Ce document est destiné aux développeurs qui maintiennent, modifient ou contribuent au package `image-tool`.

## Environnement de développement

### Prérequis

- Node.js (v14 ou supérieur)
- npm (v6 ou supérieur)

### Installation locale

1. Clonez le dépôt :

```bash
git clone https://github.com/killerwolf/visual-image-tool.git
cd visual-image-tool
```

2. Installez les dépendances :

```bash
npm install
```

## Structure du projet

```
image-tool/
├── src/                  # Code source
│   ├── index.js          # Point d'entrée
│   └── image-tool.js     # Classe principale
├── dist/                 # Fichiers de distribution (générés)
├── demos/                # Exemples de démonstration
├── docs/                 # Documentation
├── package.json          # Configuration npm
├── rollup.config.js      # Configuration de build
├── MAINTAINER.md         # Ce guide
└── README.md             # Documentation utilisateur
```

## Scripts disponibles

- `npm run build` : Génère les fichiers de distribution dans le dossier `dist/`
- `npm run dev` : Lance le build en mode watch pour le développement
- `npm test` : Exécute les tests (à implémenter)

## Processus de build

Le projet utilise Rollup pour générer trois formats de distribution :

1. **ESM** (`dist/visual-image-tool.esm.js`) : Modules ES pour les bundlers modernes
2. **UMD** (`dist/visual-image-tool.umd.js`) : Format universel minifié pour l'inclusion directe dans les navigateurs
3. **CommonJS** (`dist/visual-image-tool.js`) : Format pour Node.js

Pour lancer le build :

```bash
npm run build
```

## Tester les modifications

Après avoir effectué des modifications, vous pouvez les tester en :

1. Exécutant le build : `npm run build`
2. Ouvrant les démos dans un navigateur pour vérifier le comportement
3. Utilisant `npm link` pour tester dans un projet local

```bash
# Dans le dossier du package
npm link

# Dans votre projet de test
npm link visual-image-tool
```

## Publication sur npm

### Préparation

1. Mettez à jour la version dans `package.json` selon les règles de [SemVer](https://semver.org/) :

   - Patch (1.0.x) : Corrections de bugs
   - Minor (1.x.0) : Nouvelles fonctionnalités rétrocompatibles
   - Major (x.0.0) : Changements non rétrocompatibles

2. Mettez à jour la documentation si nécessaire

3. Assurez-vous que tous les tests passent : `npm test`

### Publication

1. Connectez-vous à npm :

```bash
npm login
```

2. Publiez le package :

```bash
npm publish
```

Pour une version bêta ou release candidate :

```bash
npm publish --tag beta
```

## Bonnes pratiques de développement

### Modifications du code

- Maintenez la compatibilité avec l'API existante
- Documentez toutes les méthodes publiques avec JSDoc
- Suivez les conventions de style du projet
- Testez sur différents navigateurs

### Gestion des versions

- Utilisez Git pour le contrôle de version
- Créez des branches pour les nouvelles fonctionnalités
- Utilisez des messages de commit descriptifs

### Documentation

- Mettez à jour la documentation lorsque vous modifiez l'API
- Maintenez les exemples à jour avec les dernières fonctionnalités

## Résolution des problèmes courants

### Erreurs de build

- Vérifiez que toutes les dépendances sont installées : `npm install`
- Nettoyez le dossier `dist/` et reconstruisez : `rm -rf dist && npm run build`

### Problèmes de compatibilité

- Testez sur différents navigateurs
- Utilisez des polyfills si nécessaire pour les fonctionnalités modernes

## Contribution

1. Créez une branche pour votre fonctionnalité
2. Effectuez vos modifications
3. Assurez-vous que les tests passent
4. Soumettez une pull request avec une description détaillée
