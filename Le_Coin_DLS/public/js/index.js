document.addEventListener("DOMContentLoaded", function() {
    

    // Fonction de recherche des annonces
    window.rechercherAnnonces = function(event) {
        event.preventDefault(); // Empêcher la soumission du formulaire

        const query = document.getElementById("search-bar").value; // Récupérer la valeur de la barre de recherche
        // Redirection vers la page liste-annonce.html avec la requête
        window.location.href = `liste-annonce.html?query=${encodeURIComponent(query)}`;
    };

    // Charger les annonces récentes au chargement de la page
    chargerDernieresAnnonces()
});


// Fonction pour charger les dernières annonces
function chargerDernieresAnnonces() {
    fetch('/api/dernieres-annonces') // Assurez-vous que cette route existe dans votre API
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de réseau');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                afficherDernieresAnnonces(data.annonces); // Afficher les annonces retournées par l'API
            } else {
                console.error('Erreur dans la réponse de l\'API:', data.message);
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement des dernières annonces:', error);
            alert('Une erreur est survenue lors du chargement des dernières annonces.');
        });
}

// Fonction pour afficher les dernières annonces
function afficherDernieresAnnonces(annonces) {
    const annoncesGrid = document.getElementById("annonces-grid");
    annoncesGrid.innerHTML = ''; // Vider le conteneur d'annonces

    if (annonces.length > 0) {
        annonces.forEach(function(annonce) {
            const annonceCard = document.createElement("div");
            annonceCard.classList.add("annonce-card");

            // Récupérer la chaîne Base64 de l'image et la séparer
            const imageSrc = annonce.image;
            const images = imageSrc.split("data:image/jpeg;base64,");
                
            // Supprimer la première chaîne vide résultant de la séparation
            images.shift();

            // Garder uniquement la première image
            const firstImage = images.length > 0 ? `data:image/jpeg;base64,${images[0]}` : '';

            annonceCard.innerHTML = `
                <img src="${firstImage}" alt="${annonce.titre}">
                <h3>${annonce.titre}</h3>
                <p>Prix: ${annonce.prix}€</p>
                <button onclick="voirAnnonce('${annonce.id}')">Voir l'annonce</button>
            `;

            annoncesGrid.appendChild(annonceCard); // Ajout de la carte d'annonce à la grille
        });
    } else {
        annoncesGrid.innerHTML = "<p>Aucune annonce trouvée.</p>"; // Message s'il n'y a pas d'annonces
    }
}

function voirAnnonce(id) {
    // Redirige vers la page view-annonce.html avec l'ID de l'annonce dans l'URL
    window.location.href = `view-annonce.html?id=${id}`;
}
