document.addEventListener("DOMContentLoaded", function() {
    const utilisateurConnecte = JSON.parse(localStorage.getItem("utilisateurConnecte"));
    if (!utilisateurConnecte) {
      window.location.href = "connexion.html"; // Redirection vers la page de connexion si non connecté
    }
    
    if (utilisateurConnecte) {
        const { email } = utilisateurConnecte;

        // Appel à l'API pour récupérer les informations de l'utilisateur depuis la base de données
        fetch(`/profil?email=${email}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const { email, pseudo, dateInscription, annonces, categorie } = data; // Inclure les annonces

                    // Convertir la date d'inscription en un format lisible
                    const dateObj = new Date(dateInscription);
                    const dateInscriptionFormatee = dateObj.toLocaleDateString("fr-FR", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    // Afficher les informations de l'utilisateur
                    document.getElementById("user-email").textContent = email;
                    document.getElementById("user-pseudo").textContent = pseudo;
                    document.getElementById("user-date").textContent = dateInscriptionFormatee;

                    // Afficher les annonces liées à l'utilisateur
                    afficherAnnoncesUtilisateur(annonces); // Passer les annonces à la fonction
                } else {
                    showCustomAlert(data.message);
                }
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des données :", error);
            });

        // Écouter le clic sur le bouton "Supprimer Compte"
        document.getElementById("supprimer-compte").addEventListener("click", function() {
            supprimerCompte(email);
        });
    } else {
        window.location.href = "connexion.html";
    }
});

// Fonction pour afficher les annonces de l'utilisateur
function afficherAnnoncesUtilisateur(annonces) {
    console.log("Données des annonces reçues :", annonces);
    const annonceDetails = document.getElementById("annonce-details");
    annonceDetails.innerHTML = ''; // Vider le conteneur avant d'afficher

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

            // Utiliser `categorie_nom` avec une valeur par défaut

            annonceDiv.innerHTML = `
                <img src="${firstImage}" alt="${annonce.titre}">
                <h2>${annonce.titre}</h2>
                <p><strong>Catégorie :</strong> ${annonce.categorie_nom}</p>
                <p><strong>Prix :</strong> ${annonce.prix}€</p>
                <button onclick="supprimerAnnonce('${annonce.id}')">Supprimer</button>
                <button onclick="marquerVendu('${annonce.id}')">Marquer comme vendue</button>
            `;
            annoncesContainer.appendChild(annonceDiv);
        });

        annonceDetails.appendChild(annoncesContainer);
    } else {
        annonceDetails.innerHTML = "<p>Aucune annonce trouvée.</p>";
    }
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
                showCustomAlert("Une erreur est survenue lors de la suppression de l'annonce.");
            }
        })
        .catch(error => {
            console.error("Erreur :", error);
        });
    }
}

// Fonction pour supprimer le compte
function supprimerCompte(email) {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
        fetch('/api/supprimer-compte', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showCustomAlert("Votre compte a été supprimé avec succès.");
                localStorage.removeItem("utilisateurConnecte"); // Retirer les données de l'utilisateur du localStorage
                window.location.href = "connexion.html"; // Rediriger vers la page de connexion
            } else {
                showCustomAlert(data.message); // Affichez le message d'erreur
            }
        })
        .catch(error => {
            console.error("Erreur lors de la suppression du compte :", error);
        });
    }
}


function marquerVendu(id) {
    if (confirm("Êtes-vous sûr de vouloir marquer cette annonce comme vendue ?")) {
        fetch('/api/marquer-vendu', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showCustomAlert("Annonce marquée comme vendue !");
                document.location.reload(); // Recharger la page pour voir les changements
            } else {
                showCustomAlert("Une erreur est survenue lors de la mise à jour de l'annonce.");
            }
        })
        .catch(error => {
            console.error("Erreur :", error);
        });
    }
}


function showCustomAlert(message) {
  Swal.fire({
    title: message,
    confirmButtonText: 'Ok'
  });
}
