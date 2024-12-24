# Tarkov Loading Screen

Une interface de chargement inspirée d'Escape From Tarkov avec intégration de l'API Tarkov Market.

## Prérequis

- Un serveur web avec PHP (comme XAMPP, WAMP, ou MAMP)
- Support de cURL dans PHP

## Installation

1. Clonez ce dépôt dans votre dossier web (par exemple, `htdocs` pour XAMPP)
2. Assurez-vous que le module PHP cURL est activé
3. Configurez votre serveur web pour autoriser les en-têtes CORS (le fichier .htaccess est déjà configuré)

## Structure du projet

```
tarkovv/
├── api/
│   └── proxy.php
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── script.js
│   └── img/
│       ├── background.jpg
│       ├── default-item.png
│       ├── favicon.ico
│       └── logo.png
├── config/
│   ├── .env
│   └── config.js
├── .htaccess
├── index.html
└── README.md
```

## Utilisation

1. Démarrez votre serveur web local
2. Accédez à l'application via `http://localhost/tarkovv`
3. L'écran de chargement s'affichera avec :
   - Une barre de progression animée
   - Des conseils qui changent toutes les 5 secondes
   - Les objets les plus chers du marché Tarkov

## Résolution des problèmes

Si vous rencontrez des erreurs CORS :
1. Vérifiez que le module PHP cURL est activé
2. Assurez-vous que le fichier .htaccess est correctement lu
3. Vérifiez les logs du serveur pour plus de détails

## Crédits

- API : [Tarkov Market](https://tarkov-market.com/)
- Images : Escape from Tarkov
