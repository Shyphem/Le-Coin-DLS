document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    // Le modèle pour xxx.x@lyceedelasalle.fr
    const emailPattern = /^[a-z]+\.[a-z]+@lyceedelasalle\.fr$/;

    // Vérification du format d'email
    if (!emailPattern.test(email)) {
        alert("Veuillez entrer une adresse email valide du type xxx.x@lyceedelasalle.fr.");
        return;
    }

    // Appeler l'API pour la connexion
    try {
        const response = await fetch('/api/connexion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
            // Stocker l'email et pseudo dans le localStorage pour l'utilisateur connecté
            localStorage.setItem("utilisateurConnecte", JSON.stringify(result.user));

            // Redirection vers la page de profil
            window.location.href = "profil.html";
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        alert("Une erreur s'est produite lors de la connexion. Veuillez réessayer.");
    }
});
