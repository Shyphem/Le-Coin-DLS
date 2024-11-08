document.addEventListener("DOMContentLoaded", async function() {
    try {
        // Appel à l'API pour récupérer les annonces signalées
        const response = await fetch(`/api/annonces?reported=1`);
        const annonces = await response.json();

        // Récupérer l'élément où les annonces seront affichées
        const annonceDetails = document.getElementById("annonce-details");

        if (annonces.length > 0) {
            const annoncesContainer = document.createElement("div");
            annoncesContainer.classList.add("annonces-container");

            // Boucle sur chaque annonce pour la générer
            annonces.forEach(annonce => {
                const annonceDiv = document.createElement("div");
                annonceDiv.classList.add("annonce-card");

                // Récupérer la chaîne Base64 de l'image et la séparer
                const imageSrc = annonce.image;
                const images = imageSrc.split("data:image/jpeg;base64,");

                // Supprimer la première chaîne vide résultant de la séparation
                images.shift();

                // Garder uniquement la première image
                const firstImage = images.length > 0 ? `data:image/jpeg;base64,${images[0]}` : '';

                // Affichage de l'annonce avec la première image seulement
                annonceDiv.innerHTML = `
                    <img src="${firstImage}" alt="${annonce.titre}">
                    <h2>${annonce.titre}</h2>
                    <p><strong>Prix :</strong> ${annonce.prix}€</p>
                    <button onclick="voirAnnonce(${annonce.id})">Voir l'annonce</button>
                `;
                annoncesContainer.appendChild(annonceDiv);
            });

            annonceDetails.appendChild(annoncesContainer);
        } else {
            annonceDetails.innerHTML = "<p>Aucune annonce signalée.</p>";
        }
    } catch (error) {
        console.error("Erreur :", error);
        document.getElementById("annonce-details").innerHTML = "<p>Erreur lors de la récupération des annonces.</p>";
    }
});

// Fonction pour afficher une annonce spécifique
function voirAnnonce(id) {
    window.location.href = `view-annonce-admin.html?id=${id}`;
}