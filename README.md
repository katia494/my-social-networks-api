# My Social Networks API

API REST de gestion d'un réseau social événementiel, développée avec Node.js, Express et MongoDB dans le cadre d'un TP.

## Technologies utilisées

- Node.js
- Express.js
- MongoDB
- Mongoose
- Postman pour les tests
- Git pour le versionnement

## Installation

1. Cloner le dépôt Git.
2. Installer les dépendances :

```bash
npm install
```

3. Démarrer MongoDB en local.
4. Lancer le serveur :

```bash
npm start
```

L'API est accessible à l'adresse :
http://localhost:3000

## Fonctionnalités

- Gestion des utilisateurs
- Création et modification d'événements
- Gestion des groupes
- Discussions et messages
- Albums photos et commentaires
- Sondages et votes
- Billetterie et réservations

## Routes principales

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /users | Consulter les utilisateurs |
| GET | /events | Consulter les événements |
| GET | /groups | Consulter les groupes |
| GET | /discussions | Consulter les discussions |
| GET | /albums | Consulter les albums |
| GET | /polls | Consulter les sondages |
| GET | /tickets | Consulter les billetteries |
| POST | /polls | Créer un sondage |
| POST | /tickets | Créer une billetterie |
| POST | /tickets/:id/reservations | Réserver un billet |

## État du projet

Les principales ressources de l'API sont implémentées et plusieurs opérations ont été testées avec Postman.

Des améliorations restent nécessaires concernant les permissions, la sécurité et certaines règles métier.