# **Le-Coin-DLS**

Bienvenue sur Le Coin DLS, une plateforme de petites annonces dédiée aux élèves de votre lycée. Inspiré par des sites comme Le Bon Coin, ce projet vise à faciliter l'achat, la vente et l'échange de manuels scolaires, de fournitures et d'autres articles entre les étudiants. Cette plateforme interne rend les échanges pratiques, sécurisés et adaptés aux besoins des élèves.

___
📌 ##**Objectifs du projet**
* Faciliter la revente et l'achat de fournitures scolaires : Permettre aux étudiants de publier des annonces pour vendre leurs manuels et autres articles scolaires.
* Créer un environnement sécurisé pour les élèves : Restreindre l'accès à la plateforme aux étudiants inscrits et connectés.
* Offrir une interface agréable et intuitive : Permettre une navigation facile et un affichage clair des annonces.

___
✨ ##**Fonctionnalités**
* Création et gestion d'annonces : Les utilisateurs peuvent poster des annonces, incluant des images, descriptions, prix et état des articles.
* Recherche d'annonces : Un système de recherche par mots-clés permet de trouver rapidement les annonces correspondantes.
* Profil utilisateur : Chaque utilisateur dispose d'une page de profil qui affiche ses informations, ainsi que la liste de ses annonces avec la possibilité de les supprimer.
* Système de messagerie : Les utilisateurs peuvent contacter les vendeurs via une fonctionnalité de chat intégré, avec stockage des messages en local pour suivre les conversations.
* Système d'authentification : Inscription et connexion sécurisées pour restreindre l'accès à la plateforme.

___
📄 ##**Pages et Structure**
* Page d'accueil (index.html) : Affiche les dernières annonces publiées et propose une barre de recherche pour filtrer les annonces.
* Page d'annonces (annonce.html) : Liste l'ensemble des annonces disponibles, avec un affichage cohérent et une taille d'image ajustée automatiquement.
* Détail de l'annonce (view-annonce.html) : Affiche une annonce spécifique avec ses détails complets, ainsi que l'option de contacter le vendeur.
* Page de profil (profil.html) : Affiche les informations de l'utilisateur connecté, telles que son pseudo, email, et la liste de ses annonces.
* Chat en ligne (chat.html) : Permet une communication directe entre l'acheteur et le vendeur.

___
🛠️ ##**Technologies utilisées**
* Frontend : HTML, CSS, JavaScript
* Backend : Node.js avec Express pour gérer les requêtes de chat en direct
* Base de données : MySQL pour stocker les utilisateurs et leurs annonces
* Authentification : Système de gestion de comptes sécurisé avec génération de pseudonymes
* Stockage de messages : Utilisation du local storage pour sauvegarder les conversations entre utilisateurs

___
📦 ##**Installation**
Prérequis
* Node.js et npm installés sur votre machine.
* Un serveur MySQL configuré pour stocker les données des utilisateurs et des annonces.
Étapes d'installation
Clonez le dépôt :

bash
Copier le code
git clone https://github.com/Shyphem/Le-Coin-DLS.git
Accédez au dossier du projet :

bash
Copier le code
cd Le-Coin-DLS
Installez les dépendances :

bash
Copier le code
npm install
Configurez la base de données :

Importez le fichier database.sql dans MySQL pour créer les tables nécessaires.
Mettez à jour les informations de connexion dans config.js.
Démarrez le serveur :

bash
Copier le code
npm start
Accédez à l'application :

Ouvrez votre navigateur et allez sur http://localhost:3000.
🎨 ##**Exemples d'utilisation**
Recherche d'annonces
L'utilisateur peut rechercher des articles en fonction de mots-clés pour trouver facilement des fournitures spécifiques.

Chat avec le vendeur
Le bouton "Contacter le vendeur" permet d'ouvrir un chat en ligne et d'engager une conversation pour discuter des détails de l'achat.

Gestion des annonces
Depuis leur profil, les utilisateurs peuvent afficher toutes leurs annonces publiées, les éditer ou les supprimer selon leurs besoins.

📚 Contribution
Les contributions sont les bienvenues pour enrichir ce projet. N'hésitez pas à ouvrir des issues ou des pull requests pour améliorer le code ou ajouter des fonctionnalités.
