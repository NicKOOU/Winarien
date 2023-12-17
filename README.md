## Services inclus

1. **Notification Service**

   - Service qui gère l'envoi de notifications en fonction des mises à jour de matchs.
   - Utilise Redis pour la communication asynchrone.
   - Correspond à l'énnoncé "Un service permettant d’envoyer des notifications à un user sur ses matchs favoris pour chaque début / fin de match / changement de score.
     Un log avec le type de notification, la lite de user destinataires et le texte suffisent".

2. **Match State Service**

   - Service de gestion de l'état des matchs.
   - Utilise Redis pour la communication asynchrone.
   - Correspond à l'énnoncé "Un service qui gère l’état d’un match ainsi que ses changements Vous ferez arriver ces changements via un pub/sub redis".

3. **User Favorite Match**

   - Service de gestion des matchs favoris pour un utilisateur.
   - Fournit des API pour ajouter, récupérer et supprimer des matchs favoris pour un utilisateur donné.
   - Correspond à l'énnoncé "Une API permettant à un user d’ajouter / retirer un match de ses favoris".
   - Swagger : http://localhost:3003/

4. **Test Match Update**

   - Service de test pour simuler les mises à jour de matchs.
   - Utilise Redis pour la communication asynchrone.
   - Ne correspond pas à l'énnoncé, mais permet de tester les services de notification et d'état de match.
   - Swagger : http://localhost:3006/

5. **Replay Favorite Match**

   - Service de replay des matchs favoris pour un utilisateur.
   - Utilise Redis pour la communication asynchrone.
   - Correspond à l'énnoncé "Une API permettant de rejouer chaque événement qui a eu lieu sur un match donné".
   - Swagger : http://localhost:3005/

6. **GET ALL MATCH**

   - Une API renvoyant à l’utilisateur l’ensemble des matchs disponibles à la prise de paris.
   - Correspond à l'énnoncé "Une API renvoyant à l’utilisateur l’ensemble des matchs disponibles à la prise de paris (en gros tous les matchs non terminés)".
   - Swagger : http://localhost:3000/

7. **Generate Matches**

   - Service de génération de matchs.
   - Ne correspond pas à l'énnoncé, mais permet de générer des matchs pour tester les services de notification et d'état de match.

## Configuration et Prérequis

1. **Avoir lancé Docker**

   ```bash
   docker-compose build
   ```

   ```bash
   docker-compose up -d
   ```

2. **Télécharger RedisInsight(Optionnel)**

   - Télécharger RedisInsight : https://redislabs.com/redis-enterprise/redis-insight/
   - Permet de visualiser les données dans Redis.

## Troubleshooting

1. **Problème de connection à la base de données**

   - Il m'est arrivé d'avoir des problèmes de connection à la base de données.
   - Pour résoudre ce problème, relancer les services (sauf mysql et redis)

2. **Impossibilité de changer de status d'un match**

   - les status ne peuvent être changés que dans l'ordre suivant : `NOT STARTED` -> `PREMATCH` -> `LIVE` -> `ENDED`

## Authors

- **Nicolas Kourban**
- **Dominique Zhang**
- **Mike Li**
- **Henri Sargerson**
