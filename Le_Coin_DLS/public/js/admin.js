document.addEventListener("DOMContentLoaded", async function() {
    try {
        // Appel � l'API pour r�cup�rer les annonces signal�es
        const response = await fetch(`/api/annonces?reported=1`);
        const annonces = await response.json();

        // R�cup�rer l'�l�ment o� les annonces seront affich�es
        const annonceDetails = document.getElementById("annonce-details");

        if (annonces.length > 0) {
            const annoncesContainer = document.createElement("div");
            annoncesContainer.classList.add("annonces-container");

            // Boucle sur chaque annonce pour la g�n�rer
            annonces.forEach(annonce => {
                const annonceDiv = document.createElement("div");
                annonceDiv.classList.add("annonce-card");

                // R�cup�rer la cha�ne Base64 de l'image et la s�parer
                const imageSrc = annonce.image;
                const images = imageSrc.split("data:image/jpeg;base64,");

                // Supprimer la premi�re cha�ne vide r�sultant de la s�paration
                images.shift();

                // Garder uniquement la premi�re image
                const firstImage = images.length > 0 ? `data:image/jpeg;base64,${images[0]}` : '';

                // Affichage de l'annonce avec la premi�re image seulement
                annonceDiv.innerHTML = `
                    <img src="${firstImage}" alt="${annonce.titre}">
                    <h2>${annonce.titre}</h2>
                    <p><strong>Prix :</strong> ${annonce.prix}�</p>
                    <button onclick="voirAnnonce(${annonce.id})">Voir l'annonce</button>
                `;
                annoncesContainer.appendChild(annonceDiv);
            });

            annonceDetails.appendChild(annoncesContainer);
        } else {
            annonceDetails.innerHTML = "<p>Aucune annonce signal�e.</p>";
        }
    } catch (error) {
        console.error("Erreur :", error);
        document.getElementById("annonce-details").innerHTML = "<p>Erreur lors de la r�cup�ration des annonces.</p>";
    }
});

// Fonction pour afficher une annonce sp�cifique
function voirAnnonce(id) {
    window.location.href = `view-annonce-admin.html?id=${id}`;
}