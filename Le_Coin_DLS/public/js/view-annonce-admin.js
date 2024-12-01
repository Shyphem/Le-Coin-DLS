document.addEventListener("DOMContentLoaded", async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const annonceId = urlParams.get('id');

    try {
        const response = await fetch(`/api/annonces/${annonceId}`);
        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération de l'annonce, statut: ${response.status}`);
        }

        const annonce = await response.json();
        const annonceDetails = document.getElementById("annonce-details");
        const images = JSON.parse(annonce.image);
        let currentIndex = 0;

        function displayImage(index) {
            const imgElement = document.getElementById("current-image");
            if (imgElement) {
                imgElement.src = images[index];
            }
        }

        let imagesHtml = ` 
            <div class="image-container">
                <button class="nav-button left" onclick="changeImage(-1)">&#10094;</button>
                <img src="${images[0]}" alt="Image 1" id="current-image" />
                <button class="nav-button right" onclick="changeImage(1)">&#10095;</button>
            </div>
        `;

        annonceDetails.innerHTML = `
            ${imagesHtml}
            <h2>${annonce.titre}</h2>
            <p><strong>Catégorie :</strong> ${annonce.categorie_nom}</p>
            <p><strong>Description :</strong> ${annonce.description}</p>
            <p><strong>État :</strong> ${annonce.etat}</p>
            <p><strong>Prix :</strong> ${annonce.prix}€</p>
            <p><strong>Date de publication :</strong> ${new Date(annonce.date_creation).toLocaleDateString('fr-FR')}</p>
            <button id="valid">Valider l'annonce</button>
            <button onclick="supprimerAnnonce('${annonce.id}')">Supprimer</button>
        `;

        // Ajouter un événement pour valider l'annonce
        document.getElementById("valid").addEventListener("click", async function() {
            if (confirm("Êtes-vous sûr de vouloir valider cette annonce ?")) {
                try {
                    const validationResponse = await fetch(`/api/annonces/${annonceId}/validate`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!validationResponse.ok) {
                        throw new Error(`Erreur lors de la validation de l'annonce : ${validationResponse.status}`);
                    }

                    alert("L'annonce a été validée avec succès.");
                    document.location.reload(); // Recharger la page pour mettre à jour l'affichage

                } catch (error) {
                    console.error("Erreur lors de la validation :", error);
                    alert("Une erreur est survenue lors de la validation de l'annonce.");
                }
            }
        });

        // Fonction pour changer d'image
        window.changeImage = function(direction) {
            currentIndex = (currentIndex + direction + images.length) % images.length;
            displayImage(currentIndex);
        };

    } catch (error) {
        console.error("Erreur :", error);
        document.getElementById("annonce-details").innerHTML = "<p>Erreur lors de la récupération de l'annonce.</p>";
    }
});


function contacterVendeur(email) {
    if (!email) {
        console.error("Email du vendeur non défini.");
        return;
    }
    window.location.href = `/chat.html?email=${encodeURIComponent(email)}`;
}

function supprimerAnnonce(id) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
        fetch('/api/supprimer-annonce', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Supprimez l'annonce du LocalStorage
                let annonces = JSON.parse(localStorage.getItem("annonces")) || [];
                annonces = annonces.filter(annonce => annonce.id !== id);
                localStorage.setItem("annonces", JSON.stringify(annonces));
                document.location.reload(); // Recharger la page pour voir les changements
            } else {
                alert("Une erreur est survenue lors de la suppression de l'annonce.");
            }
        })
        .catch(error => {
            console.error("Erreur :", error);
        });
    }
}
