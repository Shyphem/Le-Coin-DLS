const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const session = require('express-session');
const port = 3000;

// Middleware pour parser les requêtes JSON avec une taille maximale
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Middleware pour servir les fichiers statiques du dossier public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de session
app.use(session({
    secret: 'p%4ekb5t@2td#!o9AAM*M9#s3Z8u9vvAQWsEDVaz%fcVoos@8j',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // En mode non HTTPS, mettre secure: false
}));


// Middleware de vérification de l'admin avant d'afficher la page admin.html
app.get('/admin.html', (req, res) => {
    // Vérifier si l'utilisateur est authentifié et est admin
    if (!req.session.isAdmin) {
        return res.redirect('/index.html');  // Rediriger vers la page d'accueil s'il n'est pas admin
    }

    // Si l'utilisateur est un admin, servir la page admin.html
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Configuration de la connexion à la base de données
const dbConfig = {
    host: 'localhost',
    user: 'admin', // Utilisateur MySQL
    password: 'admin', // Mot de passe MySQL
    database: 'lecoindls',
};

const pool = mysql.createPool(dbConfig);

// Charger la liste des insultes au démarrage du serveur
let insultesList = [];

// Lecture du fichier insultes.txt
fs.readFile(path.join(__dirname, 'insultes.txt'), 'utf8', (err, data) => {
    if (err) {
        console.error("Erreur de lecture du fichier insultes.txt", err);
        return;
    }
    insultesList = data.split('\n').map(word => word.trim().toLowerCase());
    console.log(`Insultes chargées: ${insultesList.length} mots.`);
});

// Fonction qui vérifie si un mot contient une insulte
function contientInsulte(texte) {
    if (!texte) return false;
    texte = texte.toLowerCase(); // Convertir en minuscule pour éviter les erreurs de casse
    // Vérifier si l'un des mots de la liste d'insultes est présent dans le texte
    return insultesList.some(insulte => texte.includes(insulte));
}



// Route pour l'inscription
app.post('/api/inscription', async (req, res) => {
    const { email, password } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Vérifier si l'utilisateur existe déjà
        const [existingUser] = await connection.execute('SELECT * FROM utilisateurs WHERE email = ?', [email]);
        
        if (existingUser.length > 0) {
            res.json({ success: false, message: "Un utilisateur avec cet email existe déjà." });
            return;
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Générer un pseudo à partir de l'email
        const pseudo = email.split('@')[0];

        // Insertion dans la base de données avec date de création
        await connection.execute(
            'INSERT INTO utilisateurs (email, password, pseudo, date_creation) VALUES (?, ?, ?, NOW())',
            [email, hashedPassword, pseudo]
        );

        await connection.end(); // Fermer la connexion

        res.json({ success: true, message: "Inscription réussie !" });
    } catch (error) {
        console.error("Erreur lors de l'insertion dans la base de données :", error);
        res.json({ success: false, message: "Erreur lors de l'inscription." });
    }
});






app.post('/api/connexion', async (req, res) => {
    const { email, password } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Vérifier si l'utilisateur existe
        const [users] = await connection.execute('SELECT * FROM utilisateurs WHERE email = ?', [email]);
        
        if (users.length === 0) {
            res.json({ success: false, message: "Email ou mot de passe incorrect." });
            return;
        }

        const user = users[0];

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            res.json({ success: false, message: "Email ou mot de passe incorrect." });
            return;
        }

        // Si l'email est celui de l'administrateur, on stocke l'info dans la session
        if (email === 'a.lecoindls@lyceedelasalle.fr') {
            req.session.isAdmin = true;
            res.json({
                success: true,
                redirect: 'admin.html',  // Redirection vers admin.html
                user: {
                    email: user.email,
                    pseudo: user.pseudo  // Vous pouvez ajouter d'autres informations si nécessaire
                }
            });
        } else {
            req.session.isAdmin = false;
            res.json({
                success: true,
                redirect: 'index.html',  // Redirection vers la page d'accueil
                user: {
                    email: user.email,
                    pseudo: user.pseudo
                }
            });
        }

        // Sauvegarder l'email de l'utilisateur dans la session
        req.session.email = email;

    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.json({ success: false, message: "Erreur lors de la connexion." });
    }
});


// Route pour créer une annonce
app.post('/api/creer-annonce', async (req, res) => {
    const { titre, categorieNom, prix, description, etat, image, email } = req.body; // image contient les images encodées en JSON

    let connection;

    try {
        // Vérification des insultes dans le titre et la description
        if (contientInsulte(titre) || contientInsulte(description)) {
        // Envoi d'un message spécifique en cas d'insulte détectée
        res.status(400).json({
          message: "Des insultes ou des mots interdits ont été détectés. Veuillez changer ces mots."
        });
    }

        // Créer une connexion à la base de données
        connection = await mysql.createConnection(dbConfig);

        // Vérification de la catégorie et récupération de son ID
        const [result] = await connection.execute('SELECT id FROM categories WHERE nom = ?', [categorieNom]);

        if (!result.length) {
            return res.status(400).json({ message: "Catégorie non trouvée" });
        }

        const categorieId = result[0].id;

        const dateCreation = new Date().toISOString().replace('T', ' ').slice(0, 19); // Format YYYY-MM-DD HH:MM:SS

        
        const annonce = {
            titre,
            categorie_id: categorieId,
            prix,
            description,
            etat,
            image: JSON.stringify(image), 
            email_utilisateur: email,
            date_creation: dateCreation
        };

        await connection.execute(
            'INSERT INTO annonces (titre, categorie_id, prix, description, etat, image, email_utilisateur, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                annonce.titre,
                annonce.categorie_id,
                annonce.prix,
                annonce.description,
                annonce.etat,
                annonce.image, 
                annonce.email_utilisateur,
                annonce.date_creation
            ]
        );

        res.status(201).json({ message: "Annonce créée avec succès" });
    } catch (error) {
        console.error("Erreur lors de l'insertion de l'annonce:", error);
        res.status(500).json({ message: "Erreur lors de la création de l'annonce" });
    } finally {
        if (connection) {
            await connection.end(); 
        }
    }
});







// Route pour récupérer les annonces
app.get('/api/annonces', async (req, res) => {
    const query = req.query.query ? `%${req.query.query}%` : '%';
    const categorie = req.query.categorie || '';
    const etat = req.query.etat || '';
    const prixMax = req.query.prix_max || Number.MAX_VALUE;
    const reported = req.query.reported || 0; // Ajout d'un filtre pour 'reported'

    // Construire la requête SQL de base
    let sql = ` 
        SELECT a.*, c.nom AS categorie_nom 
        FROM annonces a 
        JOIN categories c ON a.categorie_id = c.id 
        WHERE a.titre LIKE ? AND a.vendu = 0
    `;
    const params = [query];

    // Si 'reported' est égal à 1, filtrer pour les annonces signalées
    if (reported == 1) {
        sql += ' AND a.reported = 1';
    } else {
        sql += ' AND a.reported = 0'; // Ne récupérer que les annonces non signalées par défaut
    }

    // Appliquer les autres filtres
    if (categorie) {
        sql += ' AND c.nom = ?';
        params.push(categorie);
    }

    if (etat) {
        sql += ' AND a.etat = ?';
        params.push(etat);
    }

    if (prixMax) {
        sql += ' AND a.prix <= ?';
        params.push(prixMax);
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [annonces] = await connection.execute(sql, params);
        await connection.end();
        res.json(annonces);
    } catch (error) {
        console.error("Erreur lors de la récupération des annonces :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des annonces." });
    }
});




app.get('/api/annonces/:id', async (req, res) => {
    try {
        const annonceId = req.params.id;
        const connection = await mysql.createConnection(dbConfig);
        
        const [annonce] = await connection.execute(`
            SELECT a.*, c.nom AS categorie_nom
            FROM annonces a
            JOIN categories c ON a.categorie_id = c.id
            WHERE a.id = ? 
        `, [annonceId]);

        await connection.end();

        if (annonce.length > 0) {
            res.json(annonce[0]); // Renvoyer l'annonce
        } else {
            res.status(404).json({ message: 'Annonce non trouvée' });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération de l'annonce :", error);
        res.status(500).json({ message: "Erreur lors de la récupération de l'annonce." });
    }
});



app.put('/api/annonces/:id/report', async (req, res) => {
    const annonceId = req.params.id;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(`UPDATE annonces SET reported = 1 WHERE id = ?`, [annonceId]);
        await connection.end();

        res.status(200).json({ message: "Annonce signalée avec succès." });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'annonce signalée :", error);
        res.status(500).json({ message: "Erreur lors du signalement de l'annonce." });
    }
});


// Route pour "valider" une annonce, c'est-à-dire mettre à jour 'reported' à 0
app.put('/api/annonces/:id/validate', async (req, res) => {
    const annonceId = req.params.id;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(`UPDATE annonces SET reported = 0 WHERE id = ?`, [annonceId]);
        await connection.end();

        res.status(200).json({ message: "Annonce validée avec succès." });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'annonce validée :", error);
        res.status(500).json({ message: "Erreur lors de la validation de l'annonce." });
    }
});



app.get('/profil', async (req, res) => {
    const email = req.query.email; // Email passé en paramètre

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig); // Créer une connexion à la base de données

        // Récupérer l'utilisateur
        const sqlUser = 'SELECT email, pseudo, date_creation FROM utilisateurs WHERE email = ?';
        const [userResult] = await connection.execute(sqlUser, [email]);

        if (userResult.length > 0) {
            const utilisateur = userResult[0];

            // Récupérer les annonces de l'utilisateur avec la catégorie
            const sqlAnnonces = 'SELECT a.*, c.nom AS categorie_nom FROM annonces a JOIN categories c ON a.categorie_id = c.id WHERE a.email_utilisateur = ?';
            const [annoncesResult] = await connection.execute(sqlAnnonces, [email]);

            res.send({
                success: true,
                email: utilisateur.email,
                pseudo: utilisateur.pseudo,
                dateInscription: utilisateur.date_creation,
                annonces: annoncesResult // Annonces avec catégorie_nom
            });
        } else {
            res.status(404).send({ success: false, message: "Utilisateur non trouvé." });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des données de l'utilisateur :", error);
        res.status(500).send({ success: false, message: "Erreur lors de la récupération des données." });
    } finally {
        if (connection) {
            await connection.end(); // Fermer la connexion
        }
    }
});


// Route pour supprimer une annonce
app.delete('/api/supprimer-annonce', async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ success: false, message: "ID manquant." });
    }

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Vérification si l'annonce existe avant de tenter de la supprimer
        const [checkResult] = await connection.execute('SELECT * FROM annonces WHERE id = ?', [id]);
        if (checkResult.length === 0) {
            return res.status(404).json({ success: false, message: "Annonce non trouvée." });
        }

        const [result] = await connection.execute('DELETE FROM annonces WHERE id = ?', [id]);

        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: "Annonce non trouvée." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'annonce." });
    } finally {
        if (connection) {
            await connection.end(); // Fermer la connexion
        }
    }
});




// Route pour rechercher des annonces
app.get('/api/search', async (req, res) => {
    const query = req.query.query; // Récupérer la valeur de recherche

    if (!query) {
        return res.status(400).json({ success: false, message: "Aucune requête de recherche fournie." });
    }

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);
        // Inclure le champ image dans la requête
        const sqlSearch = 'SELECT id, titre, description, prix, image FROM annonces WHERE titre LIKE ? OR description LIKE ?';
        const searchQuery = `%${query}%`; // Ajouter des jokers pour la recherche partielle
        const [searchResults] = await connection.execute(sqlSearch, [searchQuery, searchQuery]);

        res.json({
            success: true,
            annonces: searchResults // Retourner les annonces trouvées
        });
    } catch (error) {
        console.error("Erreur lors de la recherche des annonces :", error);
        res.status(500).json({ success: false, message: "Erreur lors de la recherche des annonces." });
    } finally {
        if (connection) {
            await connection.end(); // Fermer la connexion
        }
    }
});




// Route pour récupérer les 4 dernières annonces
app.get('/api/dernieres-annonces', async (req, res) => {
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig); // Établir la connexion à la base de données

        // Correction de la requête SQL
        const [result] = await connection.execute(`
            SELECT * 
            FROM annonces 
            WHERE vendu = 0 
            AND reported = 0
            ORDER BY date_creation DESC 
            LIMIT 4
        `);

        res.json({ success: true, annonces: result }); // Renvoyer les résultats
    } catch (err) {
        console.error("Erreur lors de la récupération des dernières annonces :", err);
        res.status(500).json({ success: false, message: 'Erreur de base de données.' });
    } finally {
        if (connection) {
            await connection.end(); // Fermer la connexion
        }
    }
});




app.put('/api/marquer-vendu', async (req, res) => {
    const { id } = req.body;
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        // Mise à jour de l'annonce pour définir son état comme "vendue"
        const sql = "UPDATE annonces SET vendu = 1 WHERE id = ?";
        const [result] = await connection.execute(sql, [id]);

        if (result.affectedRows > 0) {
            // Planifier la suppression de l'annonce dans 3 jours
            setTimeout(async () => {
                try {
                    const deleteSql = "DELETE FROM annonces WHERE id = ?";
                    await connection.execute(deleteSql, [id]);
                } catch (deleteErr) {
                    console.error("Erreur lors de la suppression de l'annonce après 3 jours :", deleteErr);
                }
            }, 3 * 24 * 60 * 60 * 1000); // 3 jours en millisecondes

            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: "Annonce non trouvée." });
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'annonce :", error);
        res.status(500).json({ success: false, message: "Erreur lors de la mise à jour de l'annonce." });
    } finally {
        if (connection) {
            await connection.end(); // Fermer la connexion
        }
    }
});




app.delete('/api/supprimer-compte', async (req, res) => {
    const { email } = req.body;

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);
        
        // Démarrer une transaction pour supprimer le compte et ses annonces
        await connection.beginTransaction();

        // Supprimer les annonces associées à l'utilisateur
        await connection.execute('DELETE FROM annonces WHERE email_utilisateur = ?', [email]);

        // Supprimer le compte utilisateur
        const [result] = await connection.execute('DELETE FROM utilisateurs WHERE email = ?', [email]);

        await connection.commit(); // Valider la transaction

        if (result.affectedRows > 0) {
            res.json({ success: true, message: "Compte supprimé avec succès." });
        } else {
            res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
        }
    } catch (error) {
        await connection.rollback(); // Annuler la transaction en cas d'erreur
        console.error("Erreur lors de la suppression du compte :", error);
        res.status(500).json({ success: false, message: "Erreur lors de la suppression du compte." });
    } finally {
        if (connection) {
            await connection.end(); // Fermer la connexion
        }
    }
});

// Connexion Socket.IO pour le chat
io.on('connection', (socket) => {

    // Réception des messages envoyés par les utilisateurs
    socket.on('envoyer_message', async (data) => {
        const { expediteurId, destinataireId, annonceId, contenu } = data;

        try {
            // Créer une connexion à la base de données
            const connection = await mysql.createConnection(dbConfig);

            // Insérer le message dans la table `messages`
            await connection.execute(
                'INSERT INTO messages (expediteur_id, destinataire_id, annonce_id, contenu) VALUES (?, ?, ?, ?)',
                [expediteurId, destinataireId, annonceId, contenu]
            );

            // Transmettre le message à tous les clients
            io.emit('nouveau_message', data);


            // Fermer la connexion à la base de données
            await connection.end();
        } catch (error) {
            console.error("Erreur lors de l'insertion du message :", error);
        }
    });

    socket.on('disconnect', () => {
    });
});

// Lancer le serveur
app.listen(port, () => {
    console.log(`Le serveur tourne sur http://localhost:${port}`);
});
