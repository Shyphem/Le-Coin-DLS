// Initialisation de Socket.IO
const socket = io();

// Fonction pour récupérer les paramètres de l'URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Récupérer l'email du vendeur depuis l'URL
const vendeurEmail = getQueryParam('email');

// Appel à l'API pour récupérer l'ID du vendeur à partir de son e-mail
fetch(`/api/utilisateurs?email=${encodeURIComponent(vendeurEmail)}`)
    .then(response => response.json())
    .then(data => {
        if (data.success && data.utilisateur) {
            const vendeurId = data.utilisateur.id;  // ID du vendeur
            const expediteurId = localStorage.getItem('utilisateurId');  // ID de l'utilisateur connecté depuis le localStorage

            // Maintenant, tu peux créer ou récupérer la conversation et démarrer le chat
            initialiserChat(expediteurId, vendeurId);
        } else {
            console.error('Vendeur non trouvé');
        }
    })
    .catch(error => {
        console.error('Erreur lors de la récupération du vendeur :', error);
    });



// Fonction pour envoyer un message
function envoyerMessage(expediteurId, destinataireId, annonceId, contenu) {
    socket.emit('envoyer_message', {
        expediteurId: expediteurId,
        destinataireId: destinataireId,
        annonceId: annonceId,
        contenu: contenu
    });
}

// Écouter les nouveaux messages du serveur
socket.on('nouveau_message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>Utilisateur ${data.expediteurId} :</strong> ${data.contenu}`;
    document.getElementById('messages-container').appendChild(messageElement);
});

// Gestion de l'envoi de message via le formulaire
document.getElementById('form-message').addEventListener('submit', (event) => {
    event.preventDefault();

    const expediteurId = document.getElementById('expediteur_id').value;
    const destinataireId = document.getElementById('destinataire_id').value;
    const annonceId = document.getElementById('annonce_id').value;
    const contenu = document.getElementById('message-contenu').value;

    if (contenu.trim() !== '') {
        envoyerMessage(expediteurId, destinataireId, annonceId, contenu);
        document.getElementById('message-contenu').value = ''; // Vider le champ après envoi
    }
});
