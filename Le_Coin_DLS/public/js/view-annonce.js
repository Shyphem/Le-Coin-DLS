document.addEventListener("DOMContentLoaded", async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const annonceId = urlParams.get('id');
    
    console.log("ID de l'annonce récupéré de l'URL :", annonceId);

    try {
        const response = await fetch(`/api/annonces/${annonceId}`);
        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération de l'annonce, statut: ${response.status}`);
        }

        const annonce = await response.json();
        console.log("Annonce trouvée :", annonce);

        const annonceDetails = document.getElementById("annonce-details");

        const images = JSON.parse(annonce.image);

        // Initialiser l'index de l'image actuelle
        let currentIndex = 0;

        // Fonction pour afficher l'image actuelle sans ajouter le préfixe
        function displayImage(index) {
            const imgElement = document.getElementById("current-image");
            if (imgElement) {
                imgElement.src = images[index];  // Utilisation directe sans ajout de "data:image/jpeg;base64,"
            }
        }

        // Générer le HTML pour la première image et les boutons
        let imagesHtml = `
            <div class="image-container">
              <button class="nav-button left" onclick="changeImage(-1)">&#10094;</button>
              <img src="${images[0]}" alt="Image 1" id="current-image" />
              <button class="nav-button right" onclick="changeImage(1)">&#10095;</button>
            </div>
        `;

        // Ajouter les détails de l'annonce
        annonceDetails.innerHTML = `
            ${imagesHtml}
            <h2>${annonce.titre}</h2>
            <p><strong>Catégorie :</strong> ${annonce.categorie_nom}</p>
            <p><strong>Description :</strong> ${annonce.description}</p>
            <p><strong>État :</strong> ${annonce.etat}</p>
            <p><strong>Prix :</strong> ${annonce.prix}€</p>
            <p><strong>Date de publication :</strong> ${new Date(annonce.date_creation).toLocaleDateString('fr-FR')}</p>
            <button id="contact-vendeur-btn">Contacter le vendeur</button>
        `;

        // Ajouter un événement de clic pour le bouton "Contacter le vendeur"
        document.getElementById("contact-vendeur-btn").addEventListener("click", function() {
            contacterVendeur(annonce.email_utilisateur);
        });

        // Fonction pour changer l'image
        window.changeImage = function(direction) {
            currentIndex = (currentIndex + direction + images.length) % images.length;
            displayImage(currentIndex);
        };

    } catch (error) {
        console.error("Erreur :", error);
        document.getElementById("annonce-details").innerHTML = "<p>Erreur lors de la récupération de l'annonce.</p>";
    }
});

// Fonction pour contacter le vendeur
function contacterVendeur(email) {
    if (!email) {
        console.error("Email du vendeur non défini.");
        return;
    }

    console.log("Contacter le vendeur à l'adresse :", email);
    window.location.href = `/chat.html?email=${encodeURIComponent(email)}`;
}
