# 📜 Notice d'Utilisation & Guide du Testeur — Les Chouineurs

Bienvenue dans l'équipe de test de l'application **Chouineurs** !  
Ce guide a été conçu pour vous accompagner pas à pas dans la découverte, l'utilisation et la validation de toutes les fonctionnalités de l'application.

---

## 🎯 1. Qu'est-ce que l'application « Chouineurs » ?

**Chouineurs** est le compagnon numérique officiel pour vos parties de cartes Chouine. Fini les bouts de papier froissés, les litiges de calcul mental et les oublis de chouinages ! L'application gère :
- La configuration de **3 à 5 Chouineurs** (avatars, webcam, couleurs, répliques piquantes).
- Le suivi des **Paris** (cartes 0-1, 0-1-2, 2-3-4, 1-2-3, 3-4+).
- Le décompte précis des **Chouines** (tactiques pour retourner une carte ou cartes de réserve pour +1 point).
- La saisie des **Plis** et le calcul automatique instantané des scores.
- Le **Sacre Royal** à l'issue des 4 manches avec désignation du vainqueur et du plus grand râleur.
- La **synchronisation multi-appareils** (smartphone ↔ PC) via PocketBase (collection `user_data_chouineur`).
- Un mode **Salon multijoueur en temps réel** (avec code à 4 lettres).

---

## 📱 2. Accès & Installation sur Smartphone (PWA)

L'application est une **Progressive Web App (PWA)** : elle s'installe en quelques secondes sans passer par l'App Store ou Google Play, et fonctionne plein écran comme une application native.

### Sur iPhone / iPad (Safari) :
1. Ouvrez le lien de l'application dans **Safari**.
2. Appuyez sur le bouton **Partager** (le carré avec une flèche vers le haut en bas de l'écran).
3. Faites défiler et sélectionnez **« Sur l'écran d'accueil »**.
4. Validez en appuyant sur **« Ajouter »**.

### Sur Android (Chrome) :
1. Ouvrez le lien dans **Google Chrome**.
2. Un bandeau **« Installer l'application »** apparaît automatiquement (ou appuyez sur les 3 points verticaux en haut à droite).
3. Cliquez sur **« Installer »** ou **« Ajouter à l'écran d'accueil »**.

---

## 🔑 3. Connexion au Compte & Synchronisation PocketBase

Pour synchroniser vos joueurs favoris et votre historique entre votre téléphone et votre ordinateur :

1. Cliquez sur l'icône **👤 Mon Compte** tout en haut à droite (ou l'icône de bouclier/nuage).
2. Si vous n'avez pas encore de compte :
   - Cliquez sur l'onglet **« Créer un compte »**.
   - Renseignez votre prénom/pseudo, adresse e-mail et choisissez un mot de passe (au moins 8 caractères).
   - Cliquez sur **« Créer mon compte »**.
3. Si vous avez déjà un compte :
   - Renseignez votre **E-mail** et votre **Mot de passe**.
   - Cliquez sur **« Se Connecter à PocketBase »**.
4. Une fois connecté, vous verrez le bouton **« 🔄 Synchroniser avec mon compte maintenant »** :
   - Un clic synchronise immédiatement vos profils et vos parties sauvegardées avec la collection `user_data_chouineur`.
   - Vos données sont désormais accessibles et identiques sur votre smartphone et sur votre ordinateur !

> ℹ️ **Adresse du serveur PocketBase** : Par défaut, l'application est configurée sur `https://pocketbase.cireaserveur.familyds.com`. Vous pouvez vérifier l'état de la connexion grâce au voyant vert dans la barre supérieure.

---

## 🕹️ 4. Les 4 Onglets de l'Application

La navigation s'effectue simplement via les 4 boutons en bas de l'écran :

### 👤 Onglet 1 : « Joueurs »
C'est ici que vous préparez votre table de jeu :
- **Nombre de joueurs** : Entre **3 et 5 joueurs**.
- **Ajout rapide** : Cliquez sur **« + Ajouter un Chouineur »**.
- **Personnalisation d'un joueur** :
  - **Pseudo** : Modifiez le prénom ou surnom.
  - **Avatar** : Cliquez sur la pastille photo pour ouvrir le sélecteur. Choisissez une illustration royale amusante ou **prenez directement une vraie photo avec la caméra/webcam** de votre appareil !
  - **Couleur** : Choisissez la couleur distinctive du joueur (Orange, Bleu, Vert, Rose, Violet).
  - **Favoris** : Cliquez sur la petite étoile ou le marque-page pour sauvegarder un joueur dans vos Chouineurs favoris et le réutiliser en un clic lors des prochaines parties.

---

### 🌐 Onglet 2 : « Salon » (Modes de jeu)
Trois modes s'offrent à vous :
1. **Mode Local (par défaut)** : Un seul smartphone ou tablette est posé sur la table de jeu, et le teneur de compte saisit les scores de tout le monde.
2. **Mode Salon Multijoueur (en ligne)** :
   - **Pour l'hôte (Maître du Jeu)** : Cliquez sur **« Héberger un salon »**. Un code unique de 4 lettres est généré (ex: `ABCD`).
   - **Pour les invités** : Sur leur propre smartphone, ils vont dans Salon, saisissent le code `ABCD`, leur pseudo, et cliquent sur **« Rejoindre »**. Tout se synchronise en direct !
3. **Mode Simulation** : Pratique pour tester seul l'application sans attendre d'autres joueurs (ajoute des joueurs virtuels interactifs).

---

### 🃏 Onglet 3 : « Partie » (Saisie d'une Manche)
La partie se déroule en **4 manches**. Pour chaque joueur, la saisie se fait en 3 étapes claires :

#### 1️⃣ Étape 1 : Le Pari
Chaque joueur choisit secrètement sa carte pari pour la manche :
- 🟧 **Carte Orange (0-1)** : 0 pli = 8 pts | 1 pli = 3 pts
- 🟩 **Carte Verte (0-1-2)** : 0 pli = 2 pts | 1 pli = 8 pts | 2 plis = 5 pts
- 🟦 **Carte Bleue (2-3-4)** : 2 plis = 3 pts | 3 plis = 9 pts | 4 plis = 4 pts
- 🟥 **Carte Rouge (1-2-3)** : 1 pli = 4 pts | 2 plis = 8 pts | 3 plis = 4 pts
- 🟪 **Carte Violette (3-4+) [Gros gains]** : 3 plis = 5 pts | 4 plis ou plus = 10 pts *(arches violettes contrastées et drape pourpre royal)*
> ⚠️ *Règle d'or : Une carte pari réussie est validée pour la partie et ne peut plus être réutilisée lors des manches suivantes !*

#### 2️⃣ Étape 2 : Les Chouines
Deux types de chouinages peuvent survenir pendant le jeu :
- **Chouines Tactiques (0 pt)** : Utilisées pour faire pivoter ou retourner une carte de sa main (boutons `+` / `-`).
- **Chouines de Points (+1 pt)** : Utilisées sur les cartes de réserve (+1 point bonus ajouté directement au score du joueur).

#### 3️⃣ Étape 3 : Les Plis réalisés & Validation
- Indiquez le nombre de plis remportés par chaque joueur (de **0 à 7 plis**).
- L'application vérifie automatiquement si le pari est réussi ou échoué et calcule le total des points.
- Cliquez sur **« Valider la manche »** pour enregistrer et passer à la manche suivante.

---

### 🏆 Onglet 4 : « Scores » & Historique
- **Pendant la partie** : Visualisez le tableau récapitulatif des manches, le détail des plis, des paris réussis et le cumul des points.
- **Fin de la 4ème manche (Sacre Royal)** :
  - Podium festif avec couronnement du **Roi des Chouineurs**.
  - Trophée spécial pour le joueur ayant le plus chouiné.
  - Sauvegarde automatique dans l'historique local et PocketBase.
- **Historique & Partage** :
  - Consultez les anciennes parties, rejouez une revanche.
  - Bouton de **partage de fiche de score** pour envoyer le résumé du match à vos amis.

---

## 🧪 5. Cahier de Recette pour les Testeurs (Scénarios à tester)

Voici la liste des tests prioritaires que nous vous invitons à réaliser :

| # | Scénario à tester | Action à réaliser | Résultat attendu |
|---|-------------------|-------------------|-------------------|
| **T1** | **Création d'équipe** | Dans l'onglet *Joueurs*, créer 3 joueurs, changer leurs pseudos, couleurs et avatars (tester la caméra si possible). | Les 3 joueurs s'affichent avec leurs nouveaux paramètres sans bug graphique. |
| **T2** | **Validation d'une manche** | Aller dans *Partie*, sélectionner un pari par joueur, ajouter 1 chouine à l'un d'eux, saisir les plis (ex: 2, 3, 2) et valider. | Le calcul est exact, les points s'ajoutent et la manche 2 commence. |
| **T3** | **Règle des Paris uniques** | Vérifier en manche 2 si la carte pari réussie en manche 1 est bien marquée comme validée. | La carte réussie ne doit plus être disponible ou être marquée comme déjà validée. |
| **T4** | **Partie complète (4 manches)** | Jouer les 4 manches jusqu'au bout. | L'écran du Sacre Royal s'affiche avec le podium, le vainqueur et les statistiques. |
| **T5** | **Connexion PocketBase** | Ouvrir *Mon Compte*, se connecter avec vos identifiants test. | Voyant vert connecté, profil affiché, synchronisation disponible. |
| **T6** | **Synchronisation Cloud** | Cliquer sur *Synchroniser avec mon compte*. Faire de même sur un 2ème appareil (ex: PC et Smartphone). | Les joueurs et l'historique sont immédiatement répliqués sur les deux écrans. |
| **T7** | **Salon en ligne à 2 appareils** | Sur l'appareil A, créer un Salon (code 4 lettres). Sur l'appareil B, rejoindre avec le code. | L'appareil B apparaît instantanément dans la salle d'attente de l'appareil A. |
| **T8** | **Mode Sombre / Clair** | Cliquer sur l'icône Soleil/Lune dans la barre du haut. | Bascule instantanée du thème sans scintillement ni texte illisible. |

---

## 💡 6. Comment remonter un bug ou une remarque ?

Pour chaque anomalie constatée ou idée d'amélioration :
1. **Description du problème** : Que faisiez-vous au moment où le problème s'est produit ?
2. **Appareil utilisé** : (ex: *iPhone 14 Safari*, *Samsung Galaxy S22 Chrome*, *PC Windows Firefox*).
3. **Capture d'écran** si le problème est visuel.
4. **Message d'erreur** éventuel affiché à l'écran.

Merci pour votre précieuse collaboration et que le meilleur râleur l'emporte ! 👑🃏
