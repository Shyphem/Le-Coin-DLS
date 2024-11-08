document.addEventListener("DOMContentLoaded", async function() {
    // Fonction de recherche des annonces avec les filtres
    function rechercherAnnonces(event) {
        event.preventDefault();

        // Récupérer les valeurs des filtres
        const query = document.getElementById("search-bar").value.toLowerCase();
        const categorie = document.getElementById("categorie").value;
        const etat = document.getElementById("etat").value;
        const prixMax = document.getElementById("prix-max").value;

        // Créer l'URL avec les paramètres des filtres
        const url = new URL(window.location.origin + '/liste-annonce.html');
        url.searchParams.append('query', query);
        if (categorie) url.searchParams.append('categorie', categorie);
        if (etat) url.searchParams.append('etat', etat);
        if (prixMax) url.searchParams.append('prix_max', prixMax);

        // Rediriger vers la page avec les filtres appliqués
        window.location.href = url.toString();
    }

    // Associer la fonction de filtrage au bouton "Appliquer les filtres"
    document.getElementById("apply-filters").addEventListener("click", rechercherAnnonces);

    // Vérifier et appliquer les filtres à partir de l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query') || '';
    const categorie = urlParams.get('categorie') || '';
    const etat = urlParams.get('etat') || '';
    const prixMax = urlParams.get('prix_max') || '';

    try {
        const response = await fetch(`/api/annonces?query=${query}&categorie=${categorie}&etat=${etat}&prix_max=${prixMax}`);
        const annonces = await response.json();

        // Affichage des annonces filtrées
        const annonceDetails = document.getElementById("annonce-details");
        if (annonces.length > 0) {
            const annoncesContainer = document.createElement("div");
            annoncesContainer.classList.add("annonces-container");

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
            annonceDetails.innerHTML = "<p>Aucune annonce ne correspond à votre recherche.</p>";
        }
    } catch (error) {
        console.error("Erreur :", error);
        document.getElementById("annonce-details").innerHTML = "<p>Erreur lors de la récupération des annonces.</p>";
    }
});

// Fonction pour afficher/masquer les filtres
document.getElementById('toggle-filters').addEventListener('click', function() {
    var filtersSection = document.getElementById('filters-section');
    document.body.classList.toggle("filters-visible");
    // Si les filtres sont masqués, on les affiche
    if (filtersSection.style.display === 'none' || filtersSection.style.display === '') {
        filtersSection.style.display = 'flex';
        filtersSection.classList.add('filters-active');
    } else {
        // Si les filtres sont affichés, on les masque
        filtersSection.style.display = 'none';
        filtersSection.classList.remove('filters-active');
    }
});

function voirAnnonce(id) {
    window.location.href = `view-annonce.html?id=${id}`;
}
