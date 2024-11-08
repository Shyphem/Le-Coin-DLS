document.addEventListener("DOMContentLoaded", function() {
    // Vérifiez si l'utilisateur est connecté
    const utilisateurConnecte = JSON.parse(localStorage.getItem("utilisateurConnecte"));
    if (!utilisateurConnecte) {
        window.location.href = "connexion.html"; // Redirection vers la page de connexion si non connecté
        return;
    }

    // Gestion de la soumission du formulaire d'annonce
    document.getElementById("form-annonce").addEventListener("submit", function(event) {
        event.preventDefault(); // Empêche la soumission normale du formulaire

        // Récupérer les valeurs du formulaire
        const titre = document.getElementById("titre").value;
        const categorie = document.getElementById("categorie").value;
        const prix = document.getElementById("prix").value;
        const description = document.getElementById("description").value;
        const etat = document.getElementById("etat").value;
        const imageInput = document.getElementById("image");

        // Vérification si des fichiers ont été sélectionnés
        if (imageInput.files.length > 0) {
            const images = []; // Tableau pour stocker les images encodées

            // Fonction pour lire chaque fichier image
            const readFiles = (index) => {
                if (index >= imageInput.files.length) {
                    // Une fois toutes les images lues, créez l'annonce
                    const annonce = {
                        titre: titre,
                        categorieNom: categorie, // Changer 'categorie' à 'categorieNom'
                        prix: prix,
                        description: description,
                        etat: etat,
                        image: images, // Utiliser le tableau JSON des images
                        email: utilisateurConnecte.email, // L'email de l'utilisateur connecté
                        date: new Date().toISOString() // Date actuelle
                    };

                    // Envoyer l'annonce au serveur
                    fetch('/api/creer-annonce', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(annonce)
                    })
                    .then(response => {
                        if (response.ok) {
                            alert("Annonce postée avec succès !");
                            window.location.href = "index.html"; // Redirection après le succès
                        } else {
                            alert("Erreur lors de la création de l'annonce.");
                        }
                    })
                    .catch(error => {
                        console.error("Erreur:", error);
                        alert("Une erreur s'est produite.");
                    });
                } else {
                    const file = imageInput.files[index];
                    const reader = new FileReader();

                    reader.onload = function(event) {
                        images.push(event.target.result); // Ajouter l'image encodée au tableau
                        readFiles(index + 1); // Lire le fichier suivant
                    };

                    reader.readAsDataURL(file); // Lire chaque fichier en base64
                }
            };

            readFiles(0); // Commencer à lire à partir du premier fichier
        } else {
            alert("Veuillez sélectionner au moins une image.");
        }
    });
});


function previewMultipleImages(event) {
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const fileCountSpan = document.getElementById('file-count');
    imagePreviewContainer.innerHTML = ''; // Vider le conteneur d'aperçu d'images existantes

    const files = event.target.files;
    const numFiles = files.length;

    // Mettre à jour le nombre de fichiers sélectionnés
    if (numFiles === 0) {
        fileCountSpan.textContent = 'Aucun fichier sélectionné';
    } else if (numFiles === 1) {
        fileCountSpan.textContent = '1 fichier sélectionné';
    } else {
        fileCountSpan.textContent = `${numFiles} fichiers sélectionnés`;
    }

    // Afficher un aperçu pour chaque fichier sélectionné
    for (let i = 0; i < numFiles; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function(e) {
            const imgElement = document.createElement('img');
            imgElement.src = e.target.result;
            imgElement.style.maxWidth = '150px'; // Taille maximale de chaque image
            imgElement.style.border = '1px solid #ccc';
            imgElement.style.padding = '5px';
            imgElement.style.borderRadius = '5px';
            imagePreviewContainer.appendChild(imgElement); // Ajouter l'image à l'aperçu
        };

        reader.readAsDataURL(file); // Lire chaque fichier en tant qu'URL
    }
}
